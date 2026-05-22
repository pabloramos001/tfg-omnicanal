"use client";

import { useState } from "react";

import type {
  AgentAction,
  AgentChatMessage,
  AgentConversationContext,
  AgentDetectedData,
  ResponseLanguage,
  ReservationAgentConversation,
} from "@/lib/agent";

type AgentApiResponse = {
  source: string;
  input: string;
  intent: string;
  branch: string;
  language: ResponseLanguage;
  status: string;
  reply: string;
  suggestedActions: string[];
  actionButtons: AgentAction[];
  missingFields: string[];
  detectedData: AgentDetectedData;
  confidence: "alta" | "media";
};

type AgentChatProps = {
  initialConversations: ReservationAgentConversation[];
};

const quickActions = [
  {
    label: "Reservar pista",
    message: "Quiero reservar una pista este viernes a las 19:30",
  },
  {
    label: "Cambiar clase",
    message: "Necesito cambiar una clase del sábado al domingo por la mañana",
  },
  {
    label: "Consultar cobro",
    message: "Necesito revisar un cobro y pedir la factura de mi ultima reserva",
  },
  {
    label: "Informacion general",
    message: "Quiero informacion sobre bonos, ranking y proximos torneos",
  },
];

const guidedFlows = [
  {
    title: "Reservas",
    description: "Disponibilidad, pre-reserva y cierre de franja.",
    actions: [
      { label: "Ver disponibilidad", message: "Quiero ver disponibilidad de pista este viernes por la tarde" },
      { label: "Pista exterior", message: "Busco pista exterior este viernes a las 19:30" },
      { label: "Confirmar reserva", message: "Quiero confirmar una reserva este viernes a las 19:30" },
    ],
  },
  {
    title: "Cambios de clase",
    description: "Mover horario, recuperar sesion o escalar al equipo.",
    actions: [
      { label: "Mover a mañana", message: "Quiero cambiar la clase a una franja de mañana" },
      { label: "Recuperar clase", message: "No puedo venir y quiero recuperar la clase otro dia" },
      { label: "Avisar responsable", message: "Actualiza el seguimiento en CRM y avisa al responsable" },
    ],
  },
  {
    title: "Cobros y facturas",
    description: "Facturas, revision de cargos y derivacion a administracion.",
    actions: [
      { label: "Pedir factura", message: "Quiero la factura de mi ultima reserva" },
      { label: "Revisar cobro", message: "Necesito revisar un cobro duplicado" },
      { label: "Escalar a admin", message: "Derivar la incidencia de cobro a administracion" },
    ],
  },
  {
    title: "Informacion",
    description: "Bonos, torneos, ranking y clases.",
    actions: [
      { label: "Bonos", message: "Quiero informacion sobre bonos y precios" },
      { label: "Torneos", message: "Quiero informacion sobre ranking y torneos" },
      { label: "Clases", message: "Quiero informacion sobre clases en grupo y privadas" },
    ],
  },
];

function formatBranchLabel(branch: string) {
  return branch.replaceAll("-", " ");
}

function formatDisplayText(value: string | undefined, language: ResponseLanguage = "es") {
  if (!value) {
    return value;
  }

  if (language === "en") {
    return value
      .replace(/\blunes\b/g, "Monday")
      .replace(/\bmartes\b/g, "Tuesday")
      .replace(/\bmiercoles\b/g, "Wednesday")
      .replace(/\bjueves\b/g, "Thursday")
      .replace(/\bviernes\b/g, "Friday")
      .replace(/\bsabado\b/g, "Saturday")
      .replace(/\bdomingo\b/g, "Sunday")
      .replace(/\bhoy\b/g, "today")
      .replace(/\bmanana\b/g, "tomorrow")
      .replace(/\bpor la manana\b/g, "in the morning")
      .replace(/\bpor la tarde\b/g, "in the afternoon")
      .replace(/\bpor la noche\b/g, "in the evening")
      .replace(/\bPista\b/g, "Court")
      .replace(/\bClase\b/g, "Class")
      .replace(/\bTorneo\b/g, "Tournament")
      .replace(/\bBono\b/g, "Pass");
  }

  return value.replace(/\bmiercoles\b/g, "miércoles").replace(/\bsabado\b/g, "sábado").replace(/\bmanana\b/g, "mañana");
}

function formatDetectedData(detectedData: AgentDetectedData, language: ResponseLanguage = "es") {
  return [
    formatDisplayText(detectedData.actividad, language),
    detectedData.franjaActual
      ? `${language === "en" ? "Origin" : "Origen"}: ${formatDisplayText(detectedData.franjaActual, language)}`
      : undefined,
    detectedData.nuevaFranja
      ? `${language === "en" ? "Target" : "Destino"}: ${formatDisplayText(detectedData.nuevaFranja, language)}`
      : undefined,
    formatDisplayText(detectedData.fecha, language),
    detectedData.hora,
    detectedData.horaAmbigua
      ? `${language === "en" ? "Pending time" : "Hora pendiente"}: ${formatDisplayText(detectedData.horaAmbigua, language)}`
      : undefined,
    detectedData.jugadores ? `${detectedData.jugadores} ${language === "en" ? "players" : "jugadores"}` : undefined,
    formatDisplayText(detectedData.asuntoCobro, language),
    formatDisplayText(detectedData.temaInformativo, language),
  ].filter(Boolean) as string[];
}

function isPrimaryReservationAction(action: AgentAction) {
  return action.id === "reservation-playtomic-link" || action.id === "reservation-playtomic-payment";
}

function buildContextFromResponse(response: AgentApiResponse | null): AgentConversationContext | undefined {
  if (!response) {
    return undefined;
  }

  return {
    intent: response.intent as AgentConversationContext["intent"],
    branch: response.branch as AgentConversationContext["branch"],
    language: response.language,
    status: response.status as AgentConversationContext["status"],
    detectedData: response.detectedData,
  };
}

function buildInitialMessages(conversation: ReservationAgentConversation): AgentChatMessage[] {
  return [
    {
      role: "assistant",
      content:
        "Hola, soy el agente de reservas. Puedo ayudarte con disponibilidad, cambios, pagos y seguimiento inicial antes de escalar al equipo.",
    },
    {
      role: "user",
      content: conversation.ultimaPregunta,
    },
    {
      role: "assistant",
      content: `${conversation.accionPropuesta} Proximo paso: ${conversation.proximoPaso}`,
    },
  ];
}

export function AgentChat({ initialConversations }: AgentChatProps) {
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversations[0]?.id ?? "new");
  const [draft, setDraft] = useState("");
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, AgentChatMessage[]>>(() =>
    Object.fromEntries(initialConversations.map((conversation) => [conversation.id, buildInitialMessages(conversation)])),
  );
  const [lastResponse, setLastResponse] = useState<AgentApiResponse | null>(null);
  const [isSending, setIsSending] = useState(false);

  const selectedConversation =
    initialConversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
  const selectedReservation = selectedConversation?.reservaSolicitada;

  const selectedMessages =
    messagesByConversation[selectedConversationId] ?? [
      {
        role: "assistant" as const,
        content:
          "Empieza una nueva conversacion. Puedes pedirme una reserva, un cambio de clase, ayuda con cobros o informacion general.",
      },
    ];

  async function sendMessage(rawMessage: string, contextOverride?: AgentConversationContext) {
    const trimmedDraft = rawMessage.trim();

    if (!trimmedDraft || isSending) {
      return;
    }

    const conversationKey = selectedConversationId || "new";

    setIsSending(true);
    setDraft("");
    setMessagesByConversation((currentMessages) => ({
      ...currentMessages,
      [conversationKey]: [...(currentMessages[conversationKey] ?? selectedMessages), { role: "user", content: trimmedDraft }],
    }));

    try {
      const response = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedDraft, context: contextOverride ?? buildContextFromResponse(lastResponse) }),
      });

      const data = (await response.json()) as AgentApiResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("No se pudo obtener respuesta del agente.");
      }

      setLastResponse(data);
      setMessagesByConversation((currentMessages) => ({
        ...currentMessages,
        [conversationKey]: [...(currentMessages[conversationKey] ?? []), { role: "assistant", content: data.reply }],
      }));
    } catch {
      setMessagesByConversation((currentMessages) => ({
        ...currentMessages,
        [conversationKey]: [
          ...(currentMessages[conversationKey] ?? []),
          {
            role: "assistant",
            content:
              "No he podido responder ahora mismo. Puedes reintentar o escalar la gestion al responsable para no bloquear al cliente.",
          },
        ],
      }));
    } finally {
      setIsSending(false);
    }
  }

  async function handleSendMessage() {
    await sendMessage(draft);
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSendMessage();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50/85 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#355986]/70">Conversaciones</p>
            <h2 className="mt-2 text-2xl font-semibold">Inbox del agente</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedConversationId("new");
              setLastResponse(null);
            }}
            className="rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50"
          >
            Nueva
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {initialConversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setSelectedConversationId(conversation.id);
                  setLastResponse(null);
                }}
                className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                  isSelected
                    ? "border-[#446fa6] bg-[#5d88c4] text-[#f6f9fe]"
                    : "border-stone-200 bg-white text-stone-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.2em] ${isSelected ? "text-[#dce9f8]" : "text-stone-500"}`}>
                      {conversation.canal}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{conversation.cliente}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      isSelected ? "bg-white/12 text-[#eef4fb]" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {conversation.intencion}
                  </span>
                </div>
                <p className={`mt-3 text-sm leading-6 ${isSelected ? "text-[#eef4fb]" : "text-stone-600"}`}>
                  {conversation.ultimaPregunta}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white/85 p-5 shadow-[0_8px_24px_rgba(87,83,78,0.06)]">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#355986]/70">Chat funcional</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {selectedConversation ? selectedConversation.cliente : "Nueva conversacion con el agente"}
            </h2>
          </div>
          <div className="rounded-2xl bg-stone-950 px-4 py-3 text-sm text-stone-100">
            {selectedConversation ? selectedConversation.estado : "listo para recibir consultas"}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {selectedMessages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`max-w-[90%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${
                message.role === "assistant"
                  ? "border border-stone-200 bg-stone-50 text-stone-800"
                  : "ml-auto bg-[#5d88c4] text-[#f6f9fe]"
              }`}
            >
              {message.content}
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Acciones rapidas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.message)}
                  disabled={isSending}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 transition hover:border-[#5d88c4] hover:text-[#355986] disabled:opacity-60"
                >
                  {action.label}
                </button>
              ))}
              {selectedReservation ? (
                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      `Quiero confirmar la ${selectedReservation.actividad} del ${selectedReservation.fecha} a las ${selectedReservation.hora}`,
                    )
                  }
                  disabled={isSending}
                  className="rounded-full border border-[#446fa6] bg-[#5d88c4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f6f9fe] disabled:opacity-60"
                >
                  Confirmar gestion actual
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Rutas guiadas</p>
              <p className="text-xs text-stone-500">Cada bloque abre una rama concreta del chatbot</p>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {guidedFlows.map((flow) => (
                <article key={flow.title} className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
                  <p className="text-sm font-semibold text-stone-900">{flow.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{flow.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {flow.actions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => sendMessage(action.message)}
                        disabled={isSending}
                        className="rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-[#5d88c4] hover:text-[#355986] disabled:opacity-60"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <label htmlFor="agent-message" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Escribe al agente
          </label>
          <textarea
            id="agent-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            placeholder="Ejemplo: quiero reservar una pista el viernes a las 19:30"
            className="mt-3 min-h-28 w-full resize-none rounded-[1.1rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-[#5d88c4]"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">
              El mock clasifica la intencion y responde con acciones de reserva, cambios, cobro o informacion.
            </p>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending}
              className="rounded-full bg-stone-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-50 disabled:opacity-60"
            >
              {isSending ? "Enviando" : "Enviar mensaje"}
            </button>
          </div>
        </div>

        {lastResponse ? (
          <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Clasificacion</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">{lastResponse.intent}</p>
              <p className="mt-2 text-sm text-stone-600">Rama activa: {formatBranchLabel(lastResponse.branch)}</p>
              <p className="mt-2 text-sm text-stone-600">Estado sugerido: {lastResponse.status}</p>
              <p className="mt-2 text-sm text-stone-600">Confianza: {lastResponse.confidence}</p>

              {lastResponse.missingFields.length > 0 ? (
                <div className="mt-4 rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">
                  <p className="font-semibold text-stone-900">Datos pendientes</p>
                  <p className="mt-1">{lastResponse.missingFields.join(", ")}</p>
                </div>
              ) : null}

              {formatDetectedData(lastResponse.detectedData).length > 0 ? (
                <div className="mt-4 rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">
                  <p className="font-semibold text-stone-900">Datos detectados</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formatDetectedData(lastResponse.detectedData, lastResponse.language).map((item) => (
                      <span key={item} className="rounded-full bg-[#5d88c4]/12 px-3 py-1 text-xs font-medium text-[#355986]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Acciones de esta rama</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lastResponse.actionButtons.map((action) => (
                  action.kind === "link" && action.href ? (
                    <a
                      key={action.id}
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`transition ${
                        isPrimaryReservationAction(action)
                          ? "rounded-full border border-[#2f66b1] bg-[#2f66b1] px-5 py-3 text-sm font-semibold text-white no-underline shadow-[0_12px_28px_rgba(47,102,177,0.28)] visited:text-white hover:bg-[#24548f] hover:text-white"
                          : "rounded-full border border-[#446fa6] bg-[#eef4fb] px-3 py-2 text-xs font-medium text-[#355986] hover:bg-[#dce9f8]"
                      }`}
                    >
                      {action.label}
                    </a>
                  ) : (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => sendMessage(action.message, buildContextFromResponse(lastResponse))}
                      disabled={isSending}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition disabled:opacity-60 ${
                        action.kind === "escalation"
                          ? "border-stone-900 bg-stone-900 text-stone-50 hover:bg-stone-800"
                          : action.kind === "follow-up"
                            ? "border-[#446fa6] bg-[#5d88c4] text-[#f6f9fe] hover:bg-[#507ab4]"
                            : "border-stone-300 bg-stone-50 text-stone-700 hover:border-[#5d88c4] hover:text-[#355986]"
                      }`}
                    >
                      {action.label}
                    </button>
                  )
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-stone-50 p-3 text-sm text-stone-700">
                <p className="font-semibold text-stone-900">Resumen del agente</p>
                <p className="mt-1">{lastResponse.suggestedActions.join(" · ")}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}