import { NextResponse } from "next/server";

import {
  type AgentConversationContext,
  buildAgentReply,
  buildConversationContextFromReply,
  reservationAgentCapabilities,
  reservationAgentConversations,
  reservationAgentMetrics,
} from "@/lib/agent";
import { agentTrainingDatasetSummary } from "@/lib/agent-training-dataset";
import { clubKnowledgeSummary } from "@/lib/club-knowledge";
import { findRelevantKnowledgeSnippets, getGoogleDriveKnowledgeStatus } from "@/lib/google-drive-knowledge";

export async function GET() {
  const googleDriveKnowledge = await getGoogleDriveKnowledgeStatus();

  return NextResponse.json({
    source: "ai-agent-mock",
    metrics: reservationAgentMetrics,
    capabilities: reservationAgentCapabilities,
    conversations: reservationAgentConversations,
    knowledgeBase: clubKnowledgeSummary,
    trainingDataset: agentTrainingDatasetSummary,
    googleDriveKnowledge,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string; context?: AgentConversationContext };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const knowledgeSnippets = await findRelevantKnowledgeSnippets(body.message);
    const response = await buildAgentReply(body.message, {
      ...body.context,
      knowledgeSnippets,
    });

    return NextResponse.json({
      source: "ai-agent-mock",
      input: body.message,
      nextContext: buildConversationContextFromReply(response),
      automation: {
        waitingForCustomer: response.status === "esperando-cliente",
        shouldEscalate: response.status === "pendiente-humano",
        isResolved: response.status === "resuelto",
      },
      ...response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "unknown agent error",
      },
      { status: 500 },
    );
  }
}