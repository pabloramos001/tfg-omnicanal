import Link from "next/link";

import {
  reservationAgentCapabilities,
  reservationAgentConversations,
  reservationAgentMetrics,
} from "@/lib/agent";
import { crmContacts, crmSheetColumns, crmSummary } from "@/lib/crm";

const pillars = [
  {
    title: "Entrada unificada",
    description: "Formularios, CRM y canales de mensajeria simulados sobre una unica capa de procesos.",
  },
  {
    title: "Automatizacion visible",
    description: "Workflows base para alta de contactos, actualizacion de datos y seguimiento automatizado.",
  },
  {
    title: "IA controlada",
    description: "Clasificacion de mensajes y sugerencias de respuesta preparadas para conectar con un proveedor real.",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

const workflowBlocks = [
  {
    title: "Alta desde formulario",
    description: "Jotform o formulario web crea o actualiza el contacto en Google Sheets usando el mail como clave unica.",
  },
  {
    title: "Seguimiento comercial",
    description: "El responsable revisa estado, ultimo contacto y proximo seguimiento para no perder oportunidades.",
  },
  {
    title: "Operacion omnicanal",
    description: "WhatsApp, llamadas y CRM comparten ultima actividad, notas y nivel de interes para una gestion consistente.",
  },
  {
    title: "Agente IA de reservas",
    description: "Un bot conversacional captura intencion, propone acciones y escala a humano cuando la gestion lo exige.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(93,136,196,0.2),_transparent_32%),linear-gradient(180deg,_#f5f1e8_0%,_#f4efe7_42%,_#ece6db_100%)] px-6 py-10 text-stone-900 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_20px_80px_rgba(53,42,31,0.12)] backdrop-blur sm:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex w-fit rounded-full border border-[#5d88c4]/20 bg-[#5d88c4]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#355986]">
              Demo base adaptable
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Sistema demo para automatizacion de procesos y atencion omnicanal.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              Esta base arranca el proyecto con Next.js, TypeScript y App Router para evolucionar hacia una solucion con CRM, formularios, WhatsApp e inteligencia artificial sin rehacer la arquitectura.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.75rem] bg-stone-950 px-6 py-5 text-stone-50 shadow-[0_16px_44px_rgba(28,25,23,0.25)]">
            <p className="text-sm uppercase tracking-[0.28em] text-[#b8d0ee]">CRM actual</p>
            <p className="text-3xl font-semibold">Google Sheets</p>
            <p className="max-w-xs text-sm leading-6 text-stone-300">
              Clave unica por email, pipeline comercial visible y campos listos para integrarse con formularios, WhatsApp e IA.
            </p>
            <Link
              href="/agent"
              className="mt-2 inline-flex w-fit rounded-full bg-[#5d88c4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Abrir chat del agente
            </Link>
            <Link
              href="/cliente"
              className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              Ver pagina cliente
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[1.5rem] border border-stone-200 bg-stone-50/90 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)]"
            >
              <p className="mb-3 text-sm uppercase tracking-[0.22em] text-[#355986]/70">Modulo</p>
              <h2 className="text-2xl font-semibold text-stone-900">{pillar.title}</h2>
              <p className="mt-4 text-sm leading-6 text-stone-700">{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <article className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Contactos</p>
            <p className="mt-3 text-3xl font-semibold">{crmSummary.totalContactos}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Activos</p>
            <p className="mt-3 text-3xl font-semibold">{crmSummary.activos}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Con Playtomic</p>
            <p className="mt-3 text-3xl font-semibold">{crmSummary.conPlaytomic}</p>
          </article>
          <article className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Facturacion mock</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(crmSummary.facturacionTotal)}</p>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <article className="rounded-[1.75rem] border border-stone-200 bg-stone-50/90 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#355986]/70">Estructura CRM</p>
                <h2 className="mt-2 text-2xl font-semibold">Columnas reales del Google Sheets</h2>
              </div>
              <span className="rounded-full bg-[#446fa6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#eef4fb]">
                clave unica: {crmSummary.claveUnica}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {crmSheetColumns.map((column) => (
                <span
                  key={column}
                  className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700"
                >
                  {column}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-[0_18px_44px_rgba(28,25,23,0.2)]">
            <p className="text-sm uppercase tracking-[0.25em] text-[#b8d0ee]">Workflows prioritarios</p>
            <div className="mt-5 space-y-4">
              {workflowBlocks.map((block) => (
                <div key={block.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold">{block.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{block.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white/85 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#355986]/70">Vista de demo</p>
              <h2 className="mt-2 text-2xl font-semibold">Contactos cargados desde el CRM mock</h2>
            </div>
            <span className="text-sm text-stone-600">Endpoint disponible: /api/crm/contacts</span>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {crmContacts.map((contact) => (
              <article
                key={contact.mail}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{contact.numeroCliente}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-stone-900">
                      {contact.nombre} {contact.apellidos}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#5d88c4]/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#355986]">
                    {contact.nivelInteres}
                  </span>
                </div>

                <dl className="mt-5 space-y-3 text-sm text-stone-700">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Email / clave unica</dt>
                    <dd className="text-right font-medium">{contact.claveUnica}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Fuente</dt>
                    <dd className="text-right font-medium">{contact.fuente}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Categoria</dt>
                    <dd className="text-right font-medium">{contact.categoria}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Participa en</dt>
                    <dd className="text-right font-medium">{contact.participaEn}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Estado</dt>
                    <dd className="text-right font-medium">{contact.estado}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Proximo seguimiento</dt>
                    <dd className="text-right font-medium">{contact.proximoSeguimiento}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Facturacion</dt>
                    <dd className="text-right font-medium">{formatCurrency(contact.facturacion)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone-500">Responsable</dt>
                    <dd className="text-right font-medium">{contact.responsable}</dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-2xl bg-white p-4 text-sm leading-6 text-stone-700">
                  <p className="font-semibold text-stone-900">Ultimo contacto</p>
                  <p className="mt-1">{contact.ultimoContacto}</p>
                  <p className="mt-3 font-semibold text-stone-900">Notas</p>
                  <p className="mt-1">{contact.notas}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white/85 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#355986]/70">Agente IA</p>
              <h2 className="mt-2 text-2xl font-semibold">Bot para reservas y gestiones de clientes</h2>
            </div>
            <span className="text-sm text-stone-600">Endpoint disponible: /api/ai/agent</span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-4">
            <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Conversaciones hoy</p>
              <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.conversacionesHoy}</p>
            </article>
            <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Reservas cerradas</p>
              <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.reservasCerradas}</p>
            </article>
            <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Escalados</p>
              <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.pendientesEscalado}</p>
            </article>
            <article className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Automatizacion</p>
              <p className="mt-3 text-3xl font-semibold">{reservationAgentMetrics.automatizacionEstimada}</p>
            </article>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-stone-50 shadow-[0_18px_44px_rgba(28,25,23,0.18)]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#b8d0ee]">Capacidades del agente</p>
              <div className="mt-4 space-y-3">
                {reservationAgentCapabilities.map((capability) => (
                  <div key={capability} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    {capability}
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-4">
              {reservationAgentConversations.map((conversation) => (
                <article
                  key={conversation.id}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{conversation.canal}</p>
                      <h3 className="mt-2 text-xl font-semibold text-stone-900">{conversation.cliente}</h3>
                      <p className="mt-1 text-sm text-stone-600">{conversation.mail}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-[#5d88c4]/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#355986]">
                        {conversation.intencion}
                      </span>
                      <span className="rounded-full bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-100">
                        {conversation.estado}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
                    <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-stone-700">
                      <p className="font-semibold text-stone-900">Ultima pregunta del cliente</p>
                      <p className="mt-2">{conversation.ultimaPregunta}</p>
                      <p className="mt-4 font-semibold text-stone-900">Accion propuesta por IA</p>
                      <p className="mt-2">{conversation.accionPropuesta}</p>
                      <p className="mt-4 font-semibold text-stone-900">Proximo paso</p>
                      <p className="mt-2">{conversation.proximoPaso}</p>
                    </div>

                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                      <p className="font-semibold text-stone-900">Datos operativos</p>
                      {conversation.reservaSolicitada ? (
                        <dl className="mt-3 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-stone-500">Actividad</dt>
                            <dd className="font-medium">{conversation.reservaSolicitada.actividad}</dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-stone-500">Fecha</dt>
                            <dd className="font-medium">{conversation.reservaSolicitada.fecha}</dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-stone-500">Hora</dt>
                            <dd className="font-medium">{conversation.reservaSolicitada.hora}</dd>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-stone-500">Jugadores</dt>
                            <dd className="font-medium">{conversation.reservaSolicitada.jugadores}</dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="mt-3 text-stone-600">
                          Esta conversacion no requiere crear reserva inmediata, pero si guiar o escalar la gestion.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}