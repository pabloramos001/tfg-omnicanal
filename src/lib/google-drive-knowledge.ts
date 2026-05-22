import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { google } from "googleapis";

import type { AgentKnowledgeSnippet } from "@/lib/agent";

type GoogleDriveFile = {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
};

type GoogleDriveKnowledgeDocument = {
  id: string;
  title: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  chunkCount: number;
};

type GoogleDriveKnowledgeChunk = {
  id: string;
  sourceId: string;
  title: string;
  text: string;
  normalizedTitle: string;
  normalizedText: string;
  webViewLink?: string;
};

type GoogleDriveKnowledgeStore = {
  syncedAt: string;
  folderId: string;
  documents: GoogleDriveKnowledgeDocument[];
  chunks: GoogleDriveKnowledgeChunk[];
};

const GOOGLE_DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const STORE_PATH = path.join(process.cwd(), "data", "google-drive-knowledge.json");
const WORKSPACE_EXPORTS: Record<string, string> = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: string) {
  return value.replace(/\r/g, "").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function tokenize(value: string) {
  return Array.from(new Set(normalizeText(value).split(" ").filter((token) => token.length >= 3)));
}

function chunkText(value: string, maxLength = 1000) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxLength) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    if (paragraph.length <= maxLength) {
      currentChunk = paragraph;
      continue;
    }

    for (let start = 0; start < paragraph.length; start += maxLength) {
      chunks.push(paragraph.slice(start, start + maxLength).trim());
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function isSupportedMimeType(mimeType: string) {
  return (
    mimeType in WORKSPACE_EXPORTS ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/csv"
  );
}

function getDriveConfig() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const privateKey = rawPrivateKey?.replace(/\\n/g, "\n").trim();

  return {
    folderId,
    clientEmail,
    privateKey,
  };
}

function hasDriveConfig() {
  const { folderId, clientEmail, privateKey } = getDriveConfig();

  return Boolean(folderId && clientEmail && privateKey);
}

function createDriveClient() {
  const { folderId, clientEmail, privateKey } = getDriveConfig();

  if (!folderId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Google Drive configuration. Set GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.",
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GOOGLE_DRIVE_SCOPES,
  });

  return {
    folderId,
    drive: google.drive({ version: "v3", auth }),
  };
}

async function readStreamAsText(stream: NodeJS.ReadableStream) {
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    stream.on("error", reject);
  });
}

async function listDriveFiles(folderId: string) {
  const { drive } = createDriveClient();
  const files: GoogleDriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    files.push(...(response.data.files ?? []));
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

async function downloadDriveFileText(file: GoogleDriveFile) {
  if (!file.id || !file.mimeType) {
    return undefined;
  }

  const { drive } = createDriveClient();

  if (file.mimeType in WORKSPACE_EXPORTS) {
    const response = await drive.files.export(
      {
        fileId: file.id,
        mimeType: WORKSPACE_EXPORTS[file.mimeType],
      },
      {
        responseType: "stream",
      },
    );

    return readStreamAsText(response.data as NodeJS.ReadableStream);
  }

  if (!isSupportedMimeType(file.mimeType)) {
    return undefined;
  }

  const response = await drive.files.get(
    {
      fileId: file.id,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "stream",
    },
  );

  return readStreamAsText(response.data as NodeJS.ReadableStream);
}

async function readKnowledgeStore() {
  try {
    const content = await readFile(STORE_PATH, "utf8");

    return JSON.parse(content) as GoogleDriveKnowledgeStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

async function writeKnowledgeStore(store: GoogleDriveKnowledgeStore) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function buildSnippet(text: string, maxLength = 320) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export async function syncGoogleDriveKnowledge() {
  const { folderId } = createDriveClient();
  const files = await listDriveFiles(folderId);
  const documents: GoogleDriveKnowledgeDocument[] = [];
  const chunks: GoogleDriveKnowledgeChunk[] = [];
  let skippedFiles = 0;

  for (const file of files) {
    const fileId = file.id ?? undefined;
    const fileName = file.name?.trim() || undefined;
    const mimeType = file.mimeType ?? undefined;

    if (!fileId || !fileName || !mimeType || !isSupportedMimeType(mimeType)) {
      skippedFiles += 1;
      continue;
    }

    try {
      const rawText = await downloadDriveFileText(file);
      const cleanedText = rawText ? cleanText(rawText) : undefined;

      if (!cleanedText) {
        skippedFiles += 1;
        continue;
      }

      const documentChunks = chunkText(cleanedText).map((chunk, index) => ({
        id: `${fileId}-${index + 1}`,
        sourceId: fileId,
        title: fileName,
        text: chunk,
        normalizedTitle: normalizeText(fileName),
        normalizedText: normalizeText(chunk),
        webViewLink: file.webViewLink ?? undefined,
      }));

      if (documentChunks.length === 0) {
        skippedFiles += 1;
        continue;
      }

      documents.push({
        id: fileId,
        title: fileName,
        mimeType,
        modifiedTime: file.modifiedTime ?? undefined,
        webViewLink: file.webViewLink ?? undefined,
        chunkCount: documentChunks.length,
      });
      chunks.push(...documentChunks);
    } catch {
      skippedFiles += 1;
    }
  }

  const store: GoogleDriveKnowledgeStore = {
    syncedAt: new Date().toISOString(),
    folderId,
    documents,
    chunks,
  };

  await writeKnowledgeStore(store);

  return {
    configured: true,
    syncedAt: store.syncedAt,
    folderId,
    totalFiles: files.length,
    importedFiles: documents.length,
    skippedFiles,
    chunkCount: chunks.length,
  };
}

export async function getGoogleDriveKnowledgeStatus() {
  const store = await readKnowledgeStore();

  return {
    configured: hasDriveConfig(),
    syncedAt: store?.syncedAt ?? null,
    folderId: store?.folderId ?? getDriveConfig().folderId ?? null,
    documentCount: store?.documents.length ?? 0,
    chunkCount: store?.chunks.length ?? 0,
  };
}

export async function findRelevantKnowledgeSnippets(message: string, limit = 3): Promise<AgentKnowledgeSnippet[]> {
  const store = await readKnowledgeStore();

  if (!store) {
    return [];
  }

  const queryTokens = tokenize(message);

  if (queryTokens.length === 0) {
    return [];
  }

  const scoredChunks = store.chunks
    .map((chunk) => {
      const score = queryTokens.reduce((total, token) => {
        let nextTotal = total;

        if (chunk.normalizedTitle.includes(token)) {
          nextTotal += 5;
        }

        if (chunk.normalizedText.includes(token)) {
          nextTotal += 2;
        }

        return nextTotal;
      }, 0);

      return {
        chunk,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const uniqueSources = new Set<string>();
  const snippets: AgentKnowledgeSnippet[] = [];

  for (const entry of scoredChunks) {
    if (uniqueSources.has(entry.chunk.sourceId)) {
      continue;
    }

    uniqueSources.add(entry.chunk.sourceId);
    snippets.push({
      title: entry.chunk.title,
      snippet: buildSnippet(entry.chunk.text.replace(/\s+/g, " ").trim()),
      sourceUrl: entry.chunk.webViewLink,
    });

    if (snippets.length >= limit) {
      break;
    }
  }

  return snippets;
}