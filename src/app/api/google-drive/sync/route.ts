import { NextResponse } from "next/server";

import { getGoogleDriveKnowledgeStatus, syncGoogleDriveKnowledge } from "@/lib/google-drive-knowledge";

export async function GET() {
  const status = await getGoogleDriveKnowledgeStatus();

  return NextResponse.json(status);
}

export async function POST() {
  try {
    const result = await syncGoogleDriveKnowledge();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "google drive sync failed",
      },
      { status: 500 },
    );
  }
}