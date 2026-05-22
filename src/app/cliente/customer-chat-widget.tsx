"use client";

import { useEffect, useState } from "react";

import type { AgentAction, AgentChatMessage, AgentConversationContext, AgentDetectedData, ResponseLanguage } from "@/lib/agent";

type CustomerChatWidgetProps = {
  defaultOpen?: boolean;
};

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

type PersistedChatState = {
  isOpen: boolean;
  messages: AgentChatMessage[];
  lastResponse: AgentApiResponse | null;
};

const CUSTOMER_CHAT_STORAGE_KEY = "demo-omnicanal-customer-chat";

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
    label: "Pedir factura",
    message: "Quiero la factura de mi ultima reserva",
  },
  {
    label: "Bonos",
    message: "Quiero informacion sobre bonos y precios",
  },
];

const initialMessages: AgentChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hola. Soy el asistente del club. Puedo ayudarte a reservar pista, cambiar una clase, revisar un cobro o resolver dudas sobre bonos y torneos.",
  },
];

function formatDetectedData(detectedData: AgentDetectedData, language: ResponseLanguage = "es") {
  const formatDisplayText = (value?: string) => {
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

    return value
      .replace(/\bmiercoles\b/g, "miércoles")
      .replace(/\bsabado\b/g, "sábado")
      .replace(/\bmanana\b/g, "mañana");
  };

  return [
    formatDisplayText(detectedData.actividad),
    detectedData.franjaActual ? `${language === "en" ? "Origin" : "Origen"}: ${formatDisplayText(detectedData.franjaActual)}` : undefined,
    detectedData.nuevaFranja ? `${language === "en" ? "Target" : "Destino"}: ${formatDisplayText(detectedData.nuevaFranja)}` : undefined,
    formatDisplayText(detectedData.fecha),
    detectedData.hora,
    detectedData.horaAmbigua ? `${language === "en" ? "Pending time" : "Hora pendiente"}: ${formatDisplayText(detectedData.horaAmbigua)}` : undefined,
    detectedData.jugadores ? `${detectedData.jugadores} ${language === "en" ? "players" : "jugadores"}` : undefined,
    formatDisplayText(detectedData.asuntoCobro),
    formatDisplayText(detectedData.temaInformativo),
  ].filter(Boolean) as string[];
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

function isCustomerVisibleAction(action: AgentAction) {
  const normalizedLabel = action.label.toLowerCase();
  const normalizedMessage = action.message.toLowerCase();
  const hiddenTerms = ["crm", "administracion", "admin", "responsable", "seguimiento"];

  if (action.kind === "escalation") {
    return false;
  }

  return !hiddenTerms.some(
    (term) => normalizedLabel.includes(term) || normalizedMessage.includes(term),
  );
}

function getCustomerActionLabel(action: AgentAction) {
  if (action.id === "reservation-confirm") {
    return "Confirmar datos";
  }

  if (action.id === "reservation-close") {
    return "Confirmar reserva";
  }

  if (action.id === "reservation-payment") {
    return "Continuar con el pago";
  }

  return action.label;
}

function isPrimaryReservationAction(action: AgentAction) {
  return action.id === "reservation-playtomic-link" || action.id === "reservation-playtomic-payment";
}

export function CustomerChatWidget({ defaultOpen = false }: CustomerChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<AgentChatMessage[]>(initialMessages);
  const [lastResponse, setLastResponse] = useState<AgentApiResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const customerActionButtons = lastResponse?.actionButtons.filter(isCustomerVisibleAction) ?? [];

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(CUSTOMER_CHAT_STORAGE_KEY);

      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue) as PersistedChatState;

      if (parsedValue.messages?.length) {
        setMessages(parsedValue.messages);
      }

      setLastResponse(parsedValue.lastResponse ?? null);
      setIsOpen(parsedValue.isOpen ?? defaultOpen);
    } catch {
      window.localStorage.removeItem(CUSTOMER_CHAT_STORAGE_KEY);
    }
  }, [defaultOpen]);

  useEffect(() => {
    const valueToPersist: PersistedChatState = {
      isOpen,
      messages,
      lastResponse,
    };

    window.localStorage.setItem(CUSTOMER_CHAT_STORAGE_KEY, JSON.stringify(valueToPersist));
  }, [isOpen, lastResponse, messages]);

  function resetConversation() {
    setDraft("");
    setMessages(initialMessages);
    setLastResponse(null);
    setIsOpen(false);
    window.localStorage.removeItem(CUSTOMER_CHAT_STORAGE_KEY);
  }

  async function sendMessage(rawMessage: string, contextOverride?: AgentConversationContext) {
    const message = rawMessage.trim();

    if (!message || isSending) {
      return;
    }

    setIsOpen(true);
    setIsSending(true);
    setDraft("");
    setMessages((current) => [...current, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/ai/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, context: contextOverride ?? buildContextFromResponse(lastResponse) }),
      });

      const data = (await response.json()) as AgentApiResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("No se pudo responder la consulta.");
      }

      setLastResponse(data);
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "No he podido responder ahora mismo. Puedes reintentarlo o dejar la consulta preparada para el equipo.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSubmit() {
    await sendMessage(draft);
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSubmit();
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 flex items-end justify-start gap-3 sm:bottom-6 sm:left-6 sm:right-auto">
        {isOpen ? (
          <section className="chat-widget-panel flex h-[min(42rem,calc(100vh-2rem))] w-full max-w-[24rem] flex-col overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/96 shadow-[0_26px_80px_rgba(41,60,93,0.24)] backdrop-blur sm:h-[min(42rem,calc(100vh-3rem))]">
            <div className="bg-[linear-gradient(135deg,#5d88c4_0%,#7ea4d8_100%)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#eef4fb]">Asistente online</p>
                  <h2 className="mt-2 text-xl font-semibold">Te ayudo desde aqui</h2>
                  <p className="mt-2 text-sm leading-6 text-[#eef4fb]">
                    Reserva, cambios, cobros o informacion general sin salir de esta pagina.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={resetConversation}
                    disabled={isSending}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
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

              <div className="mt-4 space-y-3">
                {messages.map((message, index) => (
                  <article
                    key={`${message.role}-${index}`}
                    className={`max-w-[88%] rounded-[1.2rem] px-4 py-3 text-sm leading-6 ${
                      message.role === "assistant"
                        ? "border border-stone-200 bg-stone-50 text-stone-800"
                        : "ml-auto bg-[#5d88c4] text-[#f6f9fe]"
                    }`}
                  >
                    {message.content}
                  </article>
                ))}
              </div>

              {lastResponse ? (
                <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50/80 p-4">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                    <span className="rounded-full bg-white px-3 py-1">{lastResponse.intent}</span>
                    <span className="rounded-full bg-white px-3 py-1">{lastResponse.branch.replaceAll("-", " ")}</span>
                    <span className="rounded-full bg-white px-3 py-1">{lastResponse.status}</span>
                  </div>

                  {lastResponse.missingFields.length > 0 ? (
                    <p className="mt-3 text-sm text-stone-600">Falta: {lastResponse.missingFields.join(", ")}.</p>
                  ) : null}

                  {formatDetectedData(lastResponse.detectedData).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formatDetectedData(lastResponse.detectedData, lastResponse.language).map((item) => (
                        <span key={item} className="rounded-full bg-[#5d88c4]/12 px-3 py-1 text-xs font-medium text-[#355986]">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {customerActionButtons.map((action) => (
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
                          {getCustomerActionLabel(action)}
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
                                : "border-stone-300 bg-white text-stone-700 hover:border-[#5d88c4] hover:text-[#355986]"
                          }`}
                        >
                            {getCustomerActionLabel(action)}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-stone-200 bg-white px-4 py-4">
              <label htmlFor="customer-chat-message" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Escribe tu consulta
              </label>
              <div className="mt-3 flex items-end gap-2">
                <textarea
                  id="customer-chat-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="Ejemplo: quiero reservar pista el viernes por la tarde"
                  className="min-h-24 flex-1 resize-none rounded-[1.1rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-[#5d88c4]"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSending}
                  className="rounded-full bg-stone-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-50 disabled:opacity-60"
                >
                  {isSending ? "Enviando" : "Enviar"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <button
          id="customer-chat-launcher"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="chat-widget-launcher flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5d88c4_0%,#7ea4d8_100%)] text-white shadow-[0_18px_42px_rgba(93,136,196,0.42)] transition hover:scale-[1.03]"
          aria-label="Abrir chatbot"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7 fill-none stroke-current stroke-[1.8]"
          >
            <path d="M7 10.5h10" strokeLinecap="round" />
            <path d="M7 14h6.5" strokeLinecap="round" />
            <path
              d="M12 3.75c-4.971 0-9 3.302-9 7.375 0 2.212 1.188 4.196 3.068 5.549.156.112.244.299.226.489l-.33 3.462 3.268-1.537a.73.73 0 0 1 .438-.05c.751.157 1.533.237 2.33.237 4.971 0 9-3.302 9-7.375s-4.029-7.375-9-7.375Z"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}