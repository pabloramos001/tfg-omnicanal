import Link from "next/link";

import { AgentChat } from "./agent-chat";

import { reservationAgentCapabilities, reservationAgentConversations, reservationAgentMetrics } from "@/lib/agent";

export default function AgentPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(93,136,196,0.18),_transparent_30%),linear-gradient(180deg,_#f5f1e8_0%,_#f3eee5_46%,_#ece6db_100%)] px-6 py-10 text-stone-900 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_20px_80px_rgba(53,42,31,0.12)] backdrop-blur sm:p-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#355986]/70">Agente IA de reservas</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Chat funcional para conversar con el bot dentro de la demo.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 sm:text-lg">
              Esta vista simula el agente que habla con clientes, clasifica la intencion y propone acciones para reservas, cambios, cobros y consultas generales antes de escribir en el CRM o escalar a una persona.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit rounded-full bg-stone-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50"
          >
            Volver a la demo
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Conversaciones hoy</p>
            <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.conversacionesHoy}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Reservas cerradas</p>
            <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.reservasCerradas}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Escalados</p>
            <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.pendientesEscalado}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Capacidades</p>
            <p className="mt-3 text-3xl font-semibold">{reservationAgentCapabilities.length}</p>
          </article>
        </div>

        <AgentChat initialConversations={reservationAgentConversations} />
      </section>
    </main>
  );
}