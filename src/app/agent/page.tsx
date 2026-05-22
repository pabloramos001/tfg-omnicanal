import { AgentChat } from "./agent-chat";

import { reservationAgentConversations } from "@/lib/agent";

export default function AgentPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(93,136,196,0.18),_transparent_30%),linear-gradient(180deg,_#f5f1e8_0%,_#f3eee5_46%,_#ece6db_100%)] px-4 py-6 text-stone-900 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/60 bg-white/75 p-4 shadow-[0_20px_80px_rgba(53,42,31,0.12)] backdrop-blur sm:p-6 lg:p-8">
        <AgentChat initialConversations={reservationAgentConversations} />
      </section>
    </main>
  );
}