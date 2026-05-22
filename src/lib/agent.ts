import {
  buildPlaytomicReservationLink,
  clubKnowledge,
  getDefaultCourtTypeLabel,
  getDefaultPlayersPerBooking,
  getMinimumBookingDurationMinutes,
  getPlaytomicAvailableTimes,
  getPlaytomicNearestAvailableTimes,
  getPreferredBookingDurationMinutes,
  isReservationTimeWithinOpeningHours,
  supportsIndoorCourts,
} from "@/lib/club-knowledge";

export type AgentIntent = "reserva" | "cambio-clase" | "cobro" | "informacion";
export type ResponseLanguage = "es" | "en";

export type AgentBranch =
  | "disponibilidad"
  | "confirmacion-reserva"
  | "cambio-horario"
  | "recuperacion-clase"
  | "factura"
  | "revision-cobro"
  | "bonos"
  | "torneos"
  | "clases"
  | "general";

export type AgentAction = {
  id: string;
  label: string;
  message: string;
  kind: "branch" | "follow-up" | "escalation" | "link";
  href?: string;
};

export type AgentKnowledgeSnippet = {
  title: string;
  snippet: string;
  sourceUrl?: string;
};

export type AgentDetectedData = {
  actividad?: string;
  fecha?: string;
  hora?: string;
  horaAmbigua?: string;
  franjaActual?: string;
  nuevaFranja?: string;
  jugadores?: number;
  asuntoCobro?: string;
  temaInformativo?: string;
};

export type AgentReply = {
  intent: AgentIntent;
  branch: AgentBranch;
  language: ResponseLanguage;
  status: "resuelto" | "pendiente-humano" | "esperando-cliente" | "en-curso";
  reply: string;
  suggestedActions: string[];
  actionButtons: AgentAction[];
  missingFields: string[];
  detectedData: AgentDetectedData;
  confidence: "alta" | "media";
};

export type AgentConversationContext = {
  intent?: AgentIntent;
  branch?: AgentBranch;
  language?: ResponseLanguage;
  status?: AgentReply["status"];
  detectedData?: AgentDetectedData;
  knowledgeSnippets?: AgentKnowledgeSnippet[];
};

export function buildConversationContextFromReply(
  reply: Pick<AgentReply, "intent" | "branch" | "language" | "status" | "detectedData">,
): AgentConversationContext {
  return {
    intent: reply.intent,
    branch: reply.branch,
    language: reply.language,
    status: reply.status,
    detectedData: reply.detectedData,
  };
}

export type AgentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ReservationAgentConversation = {
  id: string;
  cliente: string;
  mail: string;
  canal: "WhatsApp" | "Webchat" | "Instagram";
  intencion: AgentIntent;
  ultimaPregunta: string;
  estado: "resuelto" | "pendiente-humano" | "esperando-cliente" | "en-curso";
  accionPropuesta: string;
  proximoPaso: string;
  reservaSolicitada?: {
    actividad: string;
    fecha: string;
    hora: string;
    jugadores: number;
  };
};

const dayMap: Record<string, string> = {
  lunes: "lunes",
  monday: "lunes",
  martes: "martes",
  tuesday: "martes",
  miercoles: "miercoles",
  miércoles: "miercoles",
  wednesday: "miercoles",
  jueves: "jueves",
  thursday: "jueves",
  viernes: "viernes",
  friday: "viernes",
  sabado: "sabado",
  sábado: "sabado",
  saturday: "sabado",
  domingo: "domingo",
  sunday: "domingo",
  hoy: "hoy",
  today: "hoy",
  manana: "manana",
  mañana: "manana",
  tomorrow: "manana",
};

const normalizedDayEntries = Array.from(
  new Map(Object.entries(dayMap).map(([keyword, canonicalDay]) => [normalizeText(keyword), canonicalDay])).entries(),
);

const hourWordMap: Record<string, number> = {
  one: 1,
  una: 1,
  two: 2,
  dos: 2,
  three: 3,
  tres: 3,
  four: 4,
  cuatro: 4,
  five: 5,
  cinco: 5,
  six: 6,
  seis: 6,
  seven: 7,
  siete: 7,
  eight: 8,
  ocho: 8,
  nine: 9,
  nueve: 9,
  ten: 10,
  diez: 10,
  eleven: 11,
  once: 11,
  twelve: 12,
  doce: 12,
};

const monthMap: Record<string, string> = {
  enero: "enero",
  january: "enero",
  febrero: "febrero",
  february: "febrero",
  marzo: "marzo",
  march: "marzo",
  abril: "abril",
  april: "abril",
  mayo: "mayo",
  may: "mayo",
  junio: "junio",
  june: "junio",
  julio: "julio",
  july: "julio",
  agosto: "agosto",
  august: "agosto",
  septiembre: "septiembre",
  setiembre: "septiembre",
  september: "septiembre",
  octubre: "octubre",
  october: "octubre",
  noviembre: "noviembre",
  november: "noviembre",
  diciembre: "diciembre",
  december: "diciembre",
};

const displayTextMap: Record<string, string> = {
  miercoles: "miércoles",
  sabado: "sábado",
  manana: "mañana",
  lunes: "lunes",
  martes: "martes",
  jueves: "jueves",
  viernes: "viernes",
  domingo: "domingo",
  hoy: "hoy",
  "por la manana": "por la mañana",
  "por la tarde": "por la tarde",
  "por la noche": "por la noche",
  Pista: "Pista",
  Clase: "Clase",
  Torneo: "Torneo",
  Bono: "Bono",
};

const englishDisplayTextMap: Record<string, string> = {
  lunes: "Monday",
  martes: "Tuesday",
  miercoles: "Wednesday",
  jueves: "Thursday",
  viernes: "Friday",
  sabado: "Saturday",
  domingo: "Sunday",
  hoy: "today",
  manana: "tomorrow",
  "por la manana": "in the morning",
  "por la tarde": "in the afternoon",
  "por la noche": "in the evening",
  Pista: "Court",
  Clase: "Class",
  Torneo: "Tournament",
  Bono: "Pass",
};

const englishSignalWords = [
  "book",
  "court",
  "tomorrow",
  "today",
  "availability",
  "available",
  "invoice",
  "payment",
  "charge",
  "class",
  "change",
  "reschedule",
  "tournament",
  "morning",
  "afternoon",
  "evening",
  "night",
  "please",
  "i want",
  "can you",
  "what time",
  "what times",
];

const spanishSignalWords = [
  "quiero",
  "pista",
  "manana",
  "mañana",
  "hoy",
  "disponibilidad",
  "factura",
  "cobro",
  "clase",
  "cambiar",
  "torneo",
  "bono",
  "tarde",
  "noche",
  "por favor",
];

const englishActionLabelMap: Record<string, string> = {
  "Ver huecos tarde": "See afternoon slots",
  "Pasar a confirmacion": "Confirm details",
  "Pagar en Playtomic": "Pay in Playtomic",
  "Continuar reserva": "Continue booking",
  "Recuperar la semana siguiente": "Recover next week",
  "Compensar con bono": "Compensate with pass",
  "Escalar a responsable": "Escalate to manager",
  "Buscar hueco equivalente": "Find similar slot",
  "Confirmar nueva franja": "Confirm new slot",
  "Avisar responsable": "Notify manager",
  "Mover a manana": "Move to morning",
  "Mover a tarde": "Move to afternoon",
  "Registrar seguimiento": "Register follow-up",
  "Pedir datos fiscales": "Ask for billing details",
  "Factura ultima reserva": "Invoice last booking",
  "Escalar a administracion": "Escalate to admin",
  "Revisar cobro": "Review charge",
  "Consultar precio": "Check price",
  "Derivar a admin": "Send to admin",
  "Bono ranking": "Ranking pass",
  "Bono torneo": "Tournament pass",
  "Enviar comparativa": "Send comparison",
  "Ver proximos torneos": "See upcoming tournaments",
  "Segun nivel": "By level",
  "Pasar a inscripcion": "Go to registration",
  "Clases en grupo": "Group classes",
  "Clases privadas": "Private classes",
  "Ir a reserva": "Go to booking",
  "Ver bonos": "See passes",
  "Ver torneos": "See tournaments",
};

const englishSuggestedActionMap: Record<string, string> = {
  "Buscar una hora valida": "Find a valid time",
  "Reservar 60 minutos": "Book 60 minutes",
  "Reservar 90 minutos": "Book 90 minutes",
  "Elegir hora cercana": "Choose a nearby time",
  "Ver mas huecos": "See more slots",
  "Cambiar de dia": "Change day",
  "Buscar otra franja": "Search another slot",
  "Abrir Playtomic": "Open Playtomic",
  "Pedir fecha": "Ask for date",
  "Consultar disponibilidad": "Check availability",
  "Seguir con reserva": "Continue booking",
  "Elegir una hora": "Choose a time",
  "Pagar en Playtomic": "Pay in Playtomic",
  "Verificar disponibilidad": "Check availability",
  "Crear pre-reserva": "Create pre-booking",
  "Enviar link de Playtomic": "Send Playtomic link",
  "Recoger nueva franja": "Collect new slot",
  "Avisar al responsable": "Notify manager",
  "Actualizar seguimiento en CRM": "Update CRM follow-up",
  "Consultar facturacion": "Check billing",
  "Preparar factura": "Prepare invoice",
  "Escalar a administracion": "Escalate to admin",
  "Responder FAQ": "Answer FAQ",
  "Clasificar consulta": "Classify request",
  "Actualizar ultimo contacto": "Update last contact",
};

const englishMissingFieldMap: Record<string, string> = {
  actividad: "activity",
  fecha: "date",
  hora: "time",
  "confirmacion de hora": "time confirmation",
  "clase actual": "current class",
  "nueva franja": "new slot",
  "tipo de gestion": "request type",
  "tema concreto": "specific topic",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function formatDisplayText(value?: string, language: ResponseLanguage = "es") {
  if (!value) {
    return value;
  }

  const replacements = language === "en" ? englishDisplayTextMap : displayTextMap;

  return Object.entries(replacements).reduce(
    (currentValue, [source, target]) => currentValue.replace(new RegExp(`\\b${source}\\b`, "g"), target),
    value,
  );
}

function countSignalMatches(normalizedMessage: string, signals: string[]) {
  return signals.reduce((total, signal) => total + (normalizedMessage.includes(signal) ? 1 : 0), 0);
}

function detectResponseLanguage(message: string, context?: AgentConversationContext): ResponseLanguage {
  const normalizedMessage = normalizeText(message);
  const englishMatches = countSignalMatches(normalizedMessage, englishSignalWords);
  const spanishMatches = countSignalMatches(normalizedMessage, spanishSignalWords);

  if (englishMatches > spanishMatches) {
    return "en";
  }

  if (spanishMatches > englishMatches) {
    return "es";
  }

  return context?.language ?? "es";
}

function localizeActionButtons(actionButtons: AgentAction[], language: ResponseLanguage) {
  if (language === "es") {
    return actionButtons;
  }

  return actionButtons.map((action) => ({
    ...action,
    label: englishActionLabelMap[action.label] ?? action.label,
  }));
}

function localizeSuggestedActions(suggestedActions: string[], language: ResponseLanguage) {
  if (language === "es") {
    return suggestedActions;
  }

  return suggestedActions.map((action) => englishSuggestedActionMap[action] ?? action);
}

function localizeMissingFields(missingFields: string[], language: ResponseLanguage) {
  if (language === "es") {
    return missingFields;
  }

  return missingFields.map((field) => englishMissingFieldMap[field] ?? field);
}

function finalizeReply(reply: Omit<AgentReply, "language">, language: ResponseLanguage): AgentReply {
  return {
    ...reply,
    language,
    suggestedActions: localizeSuggestedActions(reply.suggestedActions, language),
    actionButtons: localizeActionButtons(reply.actionButtons, language),
    missingFields: localizeMissingFields(reply.missingFields, language),
  };
}

function isAffirmativeMessage(message: string) {
  const normalizedMessage = normalizeText(message).replace(/[!?.,;:]/g, " ").replace(/\s+/g, " ").trim();

  return /^(si|vale|ok|okay|perfecto|de acuerdo|adelante|claro|hazlo|dale|confirmo|yes|sure|go ahead|do it|book it|confirm)( please)?$/.test(
    normalizedMessage,
  );
}

function isReservationSelectionMessage(message: string) {
  const normalizedMessage = normalizeText(message).replace(/[!?.,;:]/g, " ").replace(/\s+/g, " ").trim();

  if (
    [
      "esa me va bien",
      "ese me va bien",
      "me va bien",
      "me encaja",
      "me cuadra",
      "quiero esa",
      "quiero ese",
      "reservala",
      "resérvala",
      "that works",
      "that works for me",
      "works for me",
      "i want that",
      "book that",
      "i will take that",
    ].some((pattern) => normalizedMessage === pattern || normalizedMessage.includes(pattern))
  ) {
    return true;
  }

  return /^(esa|ese|that one|that)$/.test(normalizedMessage);
}

function isAvailabilityLookupMessage(message: string) {
  const normalizedMessage = normalizeText(message);

  return (
    normalizedMessage.includes("hueco") ||
    normalizedMessage.includes("disponibil") ||
    normalizedMessage.includes("disponible") ||
    normalizedMessage.includes("libre") ||
    normalizedMessage.includes("horas hay") ||
    normalizedMessage.includes("availability") ||
    normalizedMessage.includes("available") ||
    normalizedMessage.includes("free slot") ||
    normalizedMessage.includes("free time") ||
    normalizedMessage.includes("what times") ||
    normalizedMessage.includes("what slots")
  );
}

function mentionsUnsupportedShortDuration(message: string) {
  const normalizedMessage = normalizeText(message);

  return (
    normalizedMessage.includes("media hora") ||
    normalizedMessage.includes("30 minutos") ||
    normalizedMessage.includes("30 min") ||
    normalizedMessage.includes("half an hour") ||
    normalizedMessage.includes("30 minutes") ||
    normalizedMessage.includes("30 mins")
  );
}

function extractPlayers(message: string) {
  const playersMatch = message.match(/(\d+)\s*(jugadores|personas|plazas|players|people|spots)/i);

  if (!playersMatch) {
    return undefined;
  }

  return Number(playersMatch[1]);
}

function convertTimeLabelToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function getCurrentClubTimeMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: clubKnowledge.reservations.playtomic.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hours = Number(parts.find((part) => part.type === "hour")?.value);
  const minutes = Number(parts.find((part) => part.type === "minute")?.value);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function resolveHourCandidates(baseHour: number, minutes: number, requestedDay?: string, period?: string) {
  if (period === "por la tarde" || period === "por la noche") {
    const resolvedHour = baseHour < 12 ? baseHour + 12 : baseHour;

    return {
      time: `${String(resolvedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    };
  }

  if (period === "por la manana") {
    return {
      time: `${String(baseHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    };
  }

  const morningOption = `${String(baseHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const eveningHour = baseHour < 12 ? baseHour + 12 : baseHour;
  const eveningOption = `${String(eveningHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const validOptions = [morningOption, eveningOption].filter(isReservationTimeWithinOpeningHours);

  if (requestedDay === "hoy") {
    const currentClubTimeMinutes = getCurrentClubTimeMinutes();
    const futureOptions = validOptions.filter((option) => {
      const optionMinutes = convertTimeLabelToMinutes(option);

      return optionMinutes !== undefined && currentClubTimeMinutes !== undefined && optionMinutes >= currentClubTimeMinutes;
    });

    if (futureOptions.length === 1) {
      return {
        time: futureOptions[0],
      };
    }

    if (futureOptions.length > 1) {
      return {
        ambiguousTime: `${futureOptions[0]} o ${futureOptions[1]}`,
      };
    }
  }

  if (validOptions.length === 1) {
    return {
      time: validOptions[0],
    };
  }

  if (morningOption === eveningOption) {
    return { time: morningOption };
  }

  return {
    ambiguousTime: `${validOptions[0] ?? morningOption} o ${validOptions[1] ?? eveningOption}`,
  };
}

function extractTextualTimeDetails(message: string, requestedDay?: string) {
  const normalizedMessage = normalizeText(message);
  const textualTimeMatch = normalizedMessage.match(
    /\b(?:a\s+la?s?|at)\s+(one|una|two|dos|three|tres|four|cuatro|five|cinco|six|seis|seven|siete|eight|ocho|nine|nueve|ten|diez|eleven|once|twelve|doce)(?:\s+(?:y|and)\s+(quarter|cuarto|half|media))?\b/,
  );

  if (!textualTimeMatch) {
    return undefined;
  }

  const baseHour = hourWordMap[textualTimeMatch[1]];

  if (!baseHour) {
    return undefined;
  }

  const minuteToken = textualTimeMatch[2];
  const minutes = minuteToken === "media" || minuteToken === "half" ? 30 : minuteToken === "cuarto" || minuteToken === "quarter" ? 15 : 0;
  const period = extractTimePeriod(message);

  return resolveHourCandidates(baseHour, minutes, requestedDay, period);
}

function extractNumericHourDetails(message: string, requestedDay?: string) {
  const normalizedMessage = normalizeText(message);
  const numericHourMatch = normalizedMessage.match(/\b(?:a\s+la?s?|at)\s+(\d{1,2})(?:[:.](\d{2}))?\b/);

  if (!numericHourMatch) {
    return undefined;
  }

  const baseHour = Number(numericHourMatch[1]);
  const minutes = Number(numericHourMatch[2] ?? "00");

  if (Number.isNaN(baseHour) || Number.isNaN(minutes) || baseHour < 1 || baseHour > 23 || minutes > 59) {
    return undefined;
  }

  if (baseHour >= 13) {
    return {
      time: `${String(baseHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    };
  }

  return resolveHourCandidates(baseHour, minutes, requestedDay, extractTimePeriod(message));
}

function extractTime(message: string, requestedDay?: string) {
  const meridiemTimeMatch = normalizeText(message).match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/);

  if (meridiemTimeMatch) {
    const hours = Number(meridiemTimeMatch[1]);
    const minutes = Number(meridiemTimeMatch[2] ?? "00");
    const meridiem = meridiemTimeMatch[3];
    const normalizedHours = meridiem === "pm" && hours < 12 ? hours + 12 : meridiem === "am" && hours === 12 ? 0 : hours;

    return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const timeMatch = message.match(/(\d{1,2}[:.]\d{2})/);

  if (timeMatch) {
    return timeMatch[1].replace(".", ":");
  }

  return extractTextualTimeDetails(message, requestedDay)?.time ?? extractNumericHourDetails(message, requestedDay)?.time;
}

function extractAmbiguousTime(message: string, requestedDay?: string) {
  return extractTextualTimeDetails(message, requestedDay)?.ambiguousTime ?? extractNumericHourDetails(message, requestedDay)?.ambiguousTime;
}

function extractCalendarDateText(message: string) {
  const normalizedMessage = normalizeText(message);
  const monthPattern = Object.keys(monthMap).join("|");
  const dayFirstCalendarDateMatch = normalizedMessage.match(
    new RegExp(String.raw`\b(\d{1,2})(?:\s+de)?\s+(${monthPattern})(?:\s+de\s+(\d{4}))?\b`),
  );

  if (dayFirstCalendarDateMatch) {
    const [, day, month, year] = dayFirstCalendarDateMatch;
    const canonicalMonth = monthMap[month] ?? month;

    return year ? `${day} de ${canonicalMonth} de ${year}` : `${day} de ${canonicalMonth}`;
  }

  const monthFirstCalendarDateMatch = normalizedMessage.match(
    new RegExp(String.raw`\b(${monthPattern})\s+(\d{1,2})(?:,?\s+(\d{4}))?\b`),
  );

  if (!monthFirstCalendarDateMatch) {
    return undefined;
  }

  const [, month, day, year] = monthFirstCalendarDateMatch;
  const canonicalMonth = monthMap[month] ?? month;

  return year ? `${day} de ${canonicalMonth} de ${year}` : `${day} de ${canonicalMonth}`;
}

function extractDay(message: string) {
  const explicitCalendarDate = extractCalendarDateText(message);

  if (explicitCalendarDate) {
    return explicitCalendarDate;
  }

  const normalizedMessage = normalizeText(message);

  return normalizedDayEntries.find(([keyword]) => normalizedMessage.includes(keyword))?.[1];
}

function extractLastDay(message: string) {
  const normalizedMessage = normalizeText(message);
  let lastDay: string | undefined;
  let lastIndex = -1;

  for (const [keyword, canonicalDay] of normalizedDayEntries) {
    const currentIndex = normalizedMessage.lastIndexOf(keyword);

    if (currentIndex > lastIndex) {
      lastIndex = currentIndex;
      lastDay = canonicalDay;
    }
  }

  return lastIndex >= 0 ? lastDay : undefined;
}

function extractTimePeriod(message: string) {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes("tarde") || normalizedMessage.includes("afternoon")) {
    return "por la tarde";
  }

  if (normalizedMessage.includes("noche") || normalizedMessage.includes("evening") || normalizedMessage.includes("night")) {
    return "por la noche";
  }

  if (
    normalizedMessage.includes("por la manana") ||
    normalizedMessage.includes("de manana") ||
    normalizedMessage.includes("morning")
  ) {
    return "por la manana";
  }

  return undefined;
}

function extractDayMatches(message: string) {
  const normalizedMessage = normalizeText(message);

  return normalizedDayEntries
    .map(([keyword, canonicalDay]) => ({ day: canonicalDay, index: normalizedMessage.indexOf(keyword) }))
    .filter((match) => match.index >= 0)
    .sort((left, right) => left.index - right.index);
}

function buildScheduleLabel(day: string | undefined, time: string | undefined, period: string | undefined) {
  if (!day && !time && !period) {
    return undefined;
  }

  if (day && time) {
    return `${day} a las ${time}`;
  }

  if (day && period) {
    return `${day} ${period}`;
  }

  if (day) {
    return day;
  }

  if (time) {
    return `a las ${time}`;
  }

  return `franja ${period}`;
}

function extractChangeRequest(message: string) {
  const normalizedMessage = normalizeText(message);
  const dayMatches = extractDayMatches(message);
  const explicitDayMatches = dayMatches.filter((match) => match.day !== "hoy" && match.day !== "manana");
  const useExplicitDays = explicitDayMatches.length > 0;
  const relevantDayMatches = useExplicitDays ? explicitDayMatches : dayMatches;
  const time = extractTime(message);
  const period = extractTimePeriod(message);
  const connectorIndex = Math.max(normalizedMessage.lastIndexOf(" al "), normalizedMessage.lastIndexOf(" a la "));
  const currentDay = relevantDayMatches[0]?.day;
  const targetDay = relevantDayMatches.length > 1 ? relevantDayMatches[relevantDayMatches.length - 1]?.day : undefined;
  const targetTime = connectorIndex >= 0 && time ? time : undefined;

  return {
    currentSlot: buildScheduleLabel(currentDay, undefined, undefined),
    targetSlot: buildScheduleLabel(targetDay, targetTime, period),
    targetDay,
    targetTime,
  };
}

function extractActivity(message: string) {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes("pista") || normalizedMessage.includes("court")) {
    return "Pista";
  }

  if (normalizedMessage.includes("clase") || normalizedMessage.includes("class")) {
    return "Clase";
  }

  if (normalizedMessage.includes("torneo") || normalizedMessage.includes("tournament")) {
    return "Torneo";
  }

  if (normalizedMessage.includes("bono") || normalizedMessage.includes("pass") || normalizedMessage.includes("voucher")) {
    return "Bono";
  }

  return undefined;
}

function mentionsIndoorCourt(message: string) {
  const normalizedMessage = normalizeText(message);

  return normalizedMessage.includes("indoor") || normalizedMessage.includes("cubierta") || normalizedMessage.includes("techada");
}

function detectReservationBranch(message: string, contextBranch?: AgentBranch): AgentBranch {
  const normalizedMessage = normalizeText(message);

  if (
    normalizedMessage.includes("confirmar") ||
    normalizedMessage.includes("cerrar") ||
    normalizedMessage.includes("adelante con la reserva") ||
    normalizedMessage.includes("confirm") ||
    normalizedMessage.includes("go ahead with the booking") ||
    isAffirmativeMessage(message) ||
    isReservationSelectionMessage(message)
  ) {
    return "confirmacion-reserva";
  }

  if (contextBranch === "confirmacion-reserva") {
    return "confirmacion-reserva";
  }

  return "disponibilidad";
}

function detectChangeBranch(message: string, contextBranch?: AgentBranch): AgentBranch {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes("recuper") || normalizedMessage.includes("compensar") || normalizedMessage.includes("recover") || normalizedMessage.includes("make up")) {
    return "recuperacion-clase";
  }

  if (contextBranch === "recuperacion-clase") {
    return "recuperacion-clase";
  }

  return "cambio-horario";
}

function detectBillingBranch(message: string, contextBranch?: AgentBranch): AgentBranch {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes("factura") || normalizedMessage.includes("invoice")) {
    return "factura";
  }

  if (normalizedMessage.includes("cobro") || normalizedMessage.includes("cargo") || normalizedMessage.includes("pago") || normalizedMessage.includes("charge") || normalizedMessage.includes("payment")) {
    return "revision-cobro";
  }

  if (contextBranch === "factura" || contextBranch === "revision-cobro") {
    return contextBranch;
  }

  return "revision-cobro";
}

function detectInfoBranch(message: string, contextBranch?: AgentBranch): AgentBranch {
  const normalizedMessage = normalizeText(message);

  if (normalizedMessage.includes("bono") || normalizedMessage.includes("voucher") || normalizedMessage.includes("pass")) {
    return "bonos";
  }

  if (normalizedMessage.includes("torneo") || normalizedMessage.includes("tournament")) {
    return "torneos";
  }

  if (normalizedMessage.includes("clase") || normalizedMessage.includes("class")) {
    return "clases";
  }

  if (contextBranch === "bonos" || contextBranch === "torneos" || contextBranch === "clases") {
    return contextBranch;
  }

  return "general";
}

function mergeDetectedData(previousData: AgentDetectedData | undefined, currentData: AgentDetectedData) {
  const mergedHour = currentData.hora ?? previousData?.hora;

  return {
    actividad: currentData.actividad ?? previousData?.actividad,
    fecha: currentData.fecha ?? previousData?.fecha,
    hora: mergedHour,
    horaAmbigua: mergedHour ? undefined : currentData.horaAmbigua ?? previousData?.horaAmbigua,
    franjaActual: currentData.franjaActual ?? previousData?.franjaActual,
    nuevaFranja: currentData.nuevaFranja ?? previousData?.nuevaFranja,
    jugadores: currentData.jugadores ?? previousData?.jugadores,
    asuntoCobro: currentData.asuntoCobro ?? previousData?.asuntoCobro,
    temaInformativo: currentData.temaInformativo ?? previousData?.temaInformativo,
  } satisfies AgentDetectedData;
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function ensureSentence(value: string) {
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function buildKnowledgeSupplement(snippets: AgentKnowledgeSnippet[] | undefined, language: ResponseLanguage) {
  const primarySnippet = snippets?.[0];

  if (!primarySnippet?.snippet?.trim()) {
    return undefined;
  }

  const cleanedSnippet = ensureSentence(truncateText(primarySnippet.snippet.replace(/\s+/g, " ").trim(), 280));

  return language === "en"
    ? `According to the synchronized Google Drive document \"${primarySnippet.title}\", ${cleanedSnippet}`
    : `Segun el documento sincronizado de Google Drive \"${primarySnippet.title}\", ${cleanedSnippet}`;
}

function appendKnowledgeSupplement(baseReply: string, snippets: AgentKnowledgeSnippet[] | undefined, language: ResponseLanguage) {
  const supplement = buildKnowledgeSupplement(snippets, language);

  return supplement ? `${baseReply} ${supplement}` : baseReply;
}

function buildAvailabilityLookupActions(dateText: string, times: string[]) {
  const displayDateText = formatDisplayText(dateText) ?? dateText;

  return times.slice(0, 4).map((time) => ({
    id: `reservation-availability-${time.replace(":", "-")}`,
    label: time,
    message: `Quiero reservar una pista ${displayDateText} a las ${time}`,
    kind: "follow-up" as const,
  }));
}

async function buildReservationActions(branch: AgentBranch, detectedData: AgentDetectedData): Promise<AgentAction[]> {
  const dateText = formatDisplayText(detectedData.fecha) ?? "este jueves";
  const timeText = detectedData.hora ?? "a las 19:00";
  const playersCount = detectedData.jugadores ?? getDefaultPlayersPerBooking();
  const playersSuffix = detectedData.jugadores ? ` para ${detectedData.jugadores} jugadores` : "";
  const defaultCourtLabel = getDefaultCourtTypeLabel();
  const playtomicLink = await buildPlaytomicReservationLink({
    date: detectedData.fecha,
    time: detectedData.hora,
    players: playersCount,
    courtType: defaultCourtLabel.toLowerCase().replace(/^pista\s+/, ""),
  });

  if (branch === "confirmacion-reserva") {
    if (playtomicLink) {
      return [
        {
          id: "reservation-playtomic-payment",
          label: "Pagar en Playtomic",
          message: "Abrir el enlace de Playtomic con la reserva preparada",
          kind: "link",
          href: playtomicLink,
        },
      ];
    }

    return [];
  }

  const actions: AgentAction[] = [
    {
      id: "reservation-slots",
      label: "Ver huecos tarde",
      message: `Quiero ver disponibilidad de pista ${dateText} por la tarde${playersSuffix}`,
      kind: "branch",
    },
  ];

  if (!playtomicLink) {
    actions.push({
      id: "reservation-confirm",
      label: "Pasar a confirmacion",
      message: `Quiero confirmar la reserva ${dateText} ${timeText}${playersSuffix}`,
      kind: "follow-up",
    });
  }

  if (!detectedData.hora && detectedData.horaAmbigua) {
    const [firstOption, secondOption] = detectedData.horaAmbigua.split(" o ");

    if (secondOption) {
      actions.unshift(
        {
          id: "reservation-confirm-evening-time",
          label: `Confirmar ${secondOption}`,
          message: `Quiero reservar la pista ${dateText} a las ${secondOption}${playersSuffix}`,
          kind: "follow-up",
        },
        {
          id: "reservation-confirm-morning-time",
          label: `Confirmar ${firstOption}`,
          message: `Quiero reservar la pista ${dateText} a las ${firstOption}${playersSuffix}`,
          kind: "follow-up",
        },
      );
    }
  }

  if (playtomicLink) {
    actions.push({
      id: "reservation-playtomic-link",
      label: "Continuar reserva",
      message: "Abrir el enlace de Playtomic con la reserva preparada",
      kind: "link",
      href: playtomicLink,
    });
  }

  return actions;
}

function buildChangeActions(branch: AgentBranch, detectedData?: AgentDetectedData): AgentAction[] {
  if (branch === "recuperacion-clase") {
    return [
      {
        id: "change-recovery-nextweek",
        label: "Recuperar la semana siguiente",
        message: "Quiero recuperar la clase en la siguiente sesion disponible",
        kind: "branch",
      },
      {
        id: "change-recovery-bono",
        label: "Compensar con bono",
        message: "Necesito compensar esta clase con mi bono activo",
        kind: "branch",
      },
      {
        id: "change-escalate",
        label: "Escalar a responsable",
        message: "Escala este cambio de clase al responsable del grupo",
        kind: "escalation",
      },
    ];
  }

  if (detectedData?.nuevaFranja) {
    return [
      {
        id: "change-alternative-slot",
        label: "Buscar hueco equivalente",
        message: `Quiero comprobar si hay hueco equivalente ${detectedData.nuevaFranja}`,
        kind: "branch",
      },
      {
        id: "change-confirm-target",
        label: "Confirmar nueva franja",
        message: `Deja la solicitud lista para mover la clase a ${detectedData.nuevaFranja}`,
        kind: "follow-up",
      },
      {
        id: "change-escalate-manager",
        label: "Avisar responsable",
        message: "Avisa al responsable del grupo con el cambio de clase ya resumido",
        kind: "escalation",
      },
    ];
  }

  return [
    {
      id: "change-morning",
      label: "Mover a manana",
      message: "Quiero cambiar la clase a una franja de manana",
      kind: "branch",
    },
    {
      id: "change-afternoon",
      label: "Mover a tarde",
      message: "Quiero cambiar la clase a una franja de tarde",
      kind: "branch",
    },
    {
      id: "change-crm",
      label: "Registrar seguimiento",
      message: "Actualizar seguimiento en CRM y avisar al responsable",
      kind: "follow-up",
    },
  ];
}

function buildBillingActions(branch: AgentBranch): AgentAction[] {
  if (branch === "factura") {
    return [
      {
        id: "billing-send-invoice",
        label: "Pedir datos fiscales",
        message: "Necesito emitir factura, voy a enviar mis datos fiscales",
        kind: "follow-up",
      },
      {
        id: "billing-last-reservation",
        label: "Factura ultima reserva",
        message: "Quiero la factura de mi ultima reserva",
        kind: "branch",
      },
      {
        id: "billing-admin",
        label: "Escalar a administracion",
        message: "Escala la emision de factura a administracion",
        kind: "escalation",
      },
    ];
  }

  return [
    {
      id: "billing-review-charge",
      label: "Revisar cobro",
      message: "Necesito revisar un cobro duplicado o incorrecto",
      kind: "branch",
    },
    {
      id: "billing-price",
      label: "Consultar precio",
      message: "Quiero saber el precio de la reserva o del bono antes de pagar",
      kind: "branch",
    },
    {
      id: "billing-admin-escalation",
      label: "Derivar a admin",
      message: "Derivar la incidencia de cobro a administracion",
      kind: "escalation",
    },
  ];
}

function buildInfoActions(branch: AgentBranch): AgentAction[] {
  if (branch === "bonos") {
    return [
      {
        id: "info-bonos-ranking",
        label: "Bono ranking",
        message: "Quiero informacion del bono para ranking",
        kind: "branch",
      },
      {
        id: "info-bonos-torneo",
        label: "Bono torneo",
        message: "Quiero informacion del bono para torneo",
        kind: "branch",
      },
      {
        id: "info-bonos-contact",
        label: "Enviar comparativa",
        message: "Enviame una comparativa de bonos y precios",
        kind: "follow-up",
      },
    ];
  }

  if (branch === "torneos") {
    return [
      {
        id: "info-torneos-calendar",
        label: "Ver proximos torneos",
        message: "Quiero saber cuales son los proximos torneos disponibles",
        kind: "branch",
      },
      {
        id: "info-torneos-level",
        label: "Segun nivel",
        message: "Quiero torneos segun mi nivel o categoria",
        kind: "branch",
      },
      {
        id: "info-torneos-register",
        label: "Pasar a inscripcion",
        message: "Quiero apuntarme al siguiente torneo disponible",
        kind: "follow-up",
      },
    ];
  }

  if (branch === "clases") {
    return [
      {
        id: "info-class-group",
        label: "Clases en grupo",
        message: "Quiero informacion sobre clases en grupo",
        kind: "branch",
      },
      {
        id: "info-class-private",
        label: "Clases privadas",
        message: "Quiero informacion sobre clases privadas",
        kind: "branch",
      },
      {
        id: "info-class-level",
        label: "Segun nivel",
        message: "Ayudame a elegir clase segun mi nivel",
        kind: "follow-up",
      },
    ];
  }

  return [
    {
      id: "info-general-booking",
      label: "Ir a reserva",
      message: "Quiero pasar de la consulta general a una reserva",
      kind: "branch",
    },
    {
      id: "info-general-bonos",
      label: "Ver bonos",
      message: "Quiero informacion sobre bonos y precios",
      kind: "branch",
    },
    {
      id: "info-general-tournaments",
      label: "Ver torneos",
      message: "Quiero informacion sobre ranking y torneos",
      kind: "branch",
    },
  ];
}

function detectData(message: string, intent: AgentIntent): AgentDetectedData {
  const normalizedMessage = normalizeText(message);
  const changeRequest = intent === "cambio-clase" ? extractChangeRequest(message) : undefined;
  const detectedDay = intent === "cambio-clase" ? changeRequest?.targetDay ?? extractLastDay(message) : extractDay(message);
  const data: AgentDetectedData = {
    actividad: intent === "reserva" ? extractActivity(message) ?? "Pista" : extractActivity(message),
    fecha: detectedDay,
    hora: intent === "cambio-clase" ? changeRequest?.targetTime : extractTime(message, detectedDay),
    horaAmbigua: intent === "cambio-clase" ? undefined : extractAmbiguousTime(message, detectedDay),
    franjaActual: changeRequest?.currentSlot,
    nuevaFranja: changeRequest?.targetSlot,
    jugadores: extractPlayers(message),
  };

  if (intent === "cobro") {
    if (normalizedMessage.includes("factura") || normalizedMessage.includes("invoice")) {
      data.asuntoCobro = "factura";
    } else if (normalizedMessage.includes("cobro") || normalizedMessage.includes("cargo") || normalizedMessage.includes("charge") || normalizedMessage.includes("payment")) {
      data.asuntoCobro = "revision de cobro";
    }
  }

  if (intent === "informacion") {
    if (normalizedMessage.includes("bono") || normalizedMessage.includes("voucher") || normalizedMessage.includes("pass")) {
      data.temaInformativo = "bonos";
    } else if (normalizedMessage.includes("torneo") || normalizedMessage.includes("ranking") || normalizedMessage.includes("tournament")) {
      data.temaInformativo = "torneos";
    } else if (normalizedMessage.includes("clase") || normalizedMessage.includes("class")) {
      data.temaInformativo = "clases";
    }
  }

  return data;
}

function listMissingFields(intent: AgentIntent, detectedData: AgentDetectedData) {
  if (intent === "reserva") {
    return [
      !detectedData.actividad ? "actividad" : null,
      !detectedData.fecha ? "fecha" : null,
      !detectedData.hora && detectedData.horaAmbigua ? "confirmacion de hora" : !detectedData.hora ? "hora" : null,
    ].filter(Boolean) as string[];
  }

  if (intent === "cambio-clase") {
    return [!detectedData.franjaActual ? "clase actual" : null, !detectedData.nuevaFranja ? "nueva franja" : null].filter(
      Boolean,
    ) as string[];
  }

  if (intent === "cobro") {
    return [!detectedData.asuntoCobro ? "tipo de gestion" : null].filter(Boolean) as string[];
  }

  if (intent === "informacion") {
    return [!detectedData.temaInformativo ? "tema concreto" : null].filter(Boolean) as string[];
  }

  return [];
}

export const reservationAgentCapabilities = [
  "Responder preguntas frecuentes sobre disponibilidad y precios.",
  "Recoger datos de reserva y proponer huecos disponibles.",
  "Registrar la conversacion en CRM y actualizar ultima actividad.",
  "Aplicar restricciones reales del club desde una base de conocimiento estructurada.",
  "Escalar al equipo humano cuando detecta bloqueo o baja confianza.",
];

export const reservationAgentMetrics = {
  conversacionesHoy: 18,
  reservasCerradas: 6,
  pendientesEscalado: 2,
  automatizacionEstimada: "67%",
};

export const reservationAgentConversations: ReservationAgentConversation[] = [
  {
    id: "conv-001",
    cliente: "Lucia Martin Sanz",
    mail: "lucia.martin@example.com",
    canal: "WhatsApp",
    intencion: "reserva",
    ultimaPregunta: "Quiero reservar pista el jueves por la tarde para 4 personas.",
    estado: "en-curso",
    accionPropuesta: "Ofrecer dos huecos disponibles y confirmar metodo de pago.",
    proximoPaso: "Esperar confirmacion de franja y crear reserva en Playtomic o agenda interna.",
    reservaSolicitada: {
      actividad: "Pista exterior",
      fecha: "2026-05-14",
      hora: "19:00",
      jugadores: 4,
    },
  },
  {
    id: "conv-002",
    cliente: "Diego Ruiz Lopez",
    mail: "diego.ruiz@example.com",
    canal: "Webchat",
    intencion: "informacion",
    ultimaPregunta: "Quiero saber si hay bono para torneo mas ranking.",
    estado: "esperando-cliente",
    accionPropuesta: "Enviar opciones de bono y pedir categoria de juego.",
    proximoPaso: "Retomar si no responde en 24 horas con mensaje automatizado.",
  },
  {
    id: "conv-003",
    cliente: "Carmen Gil Ortega",
    mail: "carmen.gil@example.com",
    canal: "WhatsApp",
    intencion: "cambio-clase",
    ultimaPregunta: "No puedo venir el sabado, me cambias la clase al domingo?",
    estado: "pendiente-humano",
    accionPropuesta: "Escalar al responsable porque afecta a un grupo cerrado.",
    proximoPaso: "Asignar a Andrea y bloquear respuesta automatica hasta validacion.",
  },
];

export function detectAgentIntent(message: string, context?: AgentConversationContext): AgentIntent {
  const normalizedMessage = normalizeText(message);

  if (
    context?.intent === "reserva" &&
    (normalizedMessage.includes("pago") ||
      normalizedMessage.includes("cobro") ||
      normalizedMessage.includes("payment") ||
      normalizedMessage.includes("charge") ||
      normalizedMessage.includes("crm") ||
      normalizedMessage.includes("seguimiento"))
  ) {
    return "reserva";
  }

  if (context?.intent && context.intent !== "informacion") {
    const hasNoStrongKeywords =
      !normalizedMessage.includes("reserv") &&
      !normalizedMessage.includes("book") &&
      !normalizedMessage.includes("pista") &&
      !normalizedMessage.includes("court") &&
      !normalizedMessage.includes("cambio") &&
      !normalizedMessage.includes("cambiar") &&
      !normalizedMessage.includes("change") &&
      !normalizedMessage.includes("resched") &&
      !normalizedMessage.includes("clase") &&
      !normalizedMessage.includes("class") &&
      !normalizedMessage.includes("factura") &&
      !normalizedMessage.includes("invoice") &&
      !normalizedMessage.includes("cobro") &&
      !normalizedMessage.includes("cargo") &&
      !normalizedMessage.includes("payment") &&
      !normalizedMessage.includes("charge") &&
      !normalizedMessage.includes("bono") &&
      !normalizedMessage.includes("voucher") &&
      !normalizedMessage.includes("pass") &&
      !normalizedMessage.includes("torneo") &&
      !normalizedMessage.includes("tournament") &&
      !normalizedMessage.includes("ranking");

    if (hasNoStrongKeywords) {
      return context.intent;
    }
  }

  if (
    normalizedMessage.includes("cambio") ||
    normalizedMessage.includes("cambia") ||
    normalizedMessage.includes("cambiar") ||
    normalizedMessage.includes("mover") ||
    normalizedMessage.includes("otro dia") ||
    normalizedMessage.includes("domingo") ||
    normalizedMessage.includes("sabado") ||
    normalizedMessage.includes("change") ||
    normalizedMessage.includes("reschedule") ||
    normalizedMessage.includes("move") ||
    normalizedMessage.includes("another day") ||
    normalizedMessage.includes("sunday") ||
    normalizedMessage.includes("saturday")
  ) {
    return "cambio-clase";
  }

  if (
    normalizedMessage.includes("pago") ||
    normalizedMessage.includes("cobro") ||
    normalizedMessage.includes("factura") ||
    normalizedMessage.includes("cargo") ||
    normalizedMessage.includes("payment") ||
    normalizedMessage.includes("invoice") ||
    normalizedMessage.includes("charge")
  ) {
    return "cobro";
  }

  if (
    normalizedMessage.includes("reserv") ||
    normalizedMessage.includes("book") ||
    normalizedMessage.includes("pista") ||
    normalizedMessage.includes("court") ||
    normalizedMessage.includes("disponibilidad") ||
    normalizedMessage.includes("availability") ||
    normalizedMessage.includes("available") ||
    normalizedMessage.includes("hueco libre") ||
    normalizedMessage.includes("hueco") ||
    normalizedMessage.includes("libre") ||
    normalizedMessage.includes("free slot") ||
    normalizedMessage.includes("free time")
  ) {
    return "reserva";
  }

  return "informacion";
}

export async function buildAgentReply(message: string, context?: AgentConversationContext): Promise<AgentReply> {
  const language = detectResponseLanguage(message, context);
  const intent = detectAgentIntent(message, context);
  const currentDetectedData = detectData(message, intent);
  let detectedData = mergeDetectedData(context?.detectedData, currentDetectedData);
  let missingFields = listMissingFields(intent, detectedData);
  const defaultCourtLabel = language === "en" ? "outdoor court" : getDefaultCourtTypeLabel().toLowerCase();
  const requestedIndoorCourt = mentionsIndoorCourt(message) && !supportsIndoorCourts();
  const isAffirmative = isAffirmativeMessage(message);

  if (intent === "reserva") {
    const displayDate = formatDisplayText(detectedData.fecha, language);
    const displayAmbiguousTime = formatDisplayText(detectedData.horaAmbigua, language);
    const requestedPeriod = formatDisplayText(extractTimePeriod(message), language);

    if (mentionsUnsupportedShortDuration(message)) {
      return finalizeReply({
        intent,
        branch: "disponibilidad",
        status: "esperando-cliente",
        reply:
          language === "en"
            ? `I cannot prepare half-hour bookings. The minimum booking length at the club is ${getMinimumBookingDurationMinutes()} minutes and, when there is availability, the usual booking length is ${getPreferredBookingDurationMinutes()} minutes. If you tell me the day and time, I will look for a valid option.`
            : `No puedo preparar reservas de media hora. En el club el minimo es de ${getMinimumBookingDurationMinutes()} minutos y, cuando hay hueco, la reserva habitual es de ${getPreferredBookingDurationMinutes()} minutos. Si me dices dia y hora, te busco una opcion valida.`,
        suggestedActions: ["Buscar una hora valida", "Reservar 60 minutos", "Reservar 90 minutos"],
        actionButtons: await buildReservationActions("disponibilidad", detectedData),
        missingFields,
        detectedData,
        confidence: "alta",
      }, language);
    }

    if (isAvailabilityLookupMessage(message) && !currentDetectedData.hora && !currentDetectedData.horaAmbigua) {
      detectedData = {
        ...detectedData,
        hora: undefined,
        horaAmbigua: undefined,
      };
      missingFields = detectedData.fecha ? [] : ["fecha"];
    }

    const branch =
      isAffirmative && context?.branch === "disponibilidad" && missingFields.length === 0
        ? "confirmacion-reserva"
        : detectReservationBranch(message, context?.branch);

    if (detectedData.fecha && detectedData.hora && !detectedData.horaAmbigua) {
      const nearestAvailability = await getPlaytomicNearestAvailableTimes({
        date: detectedData.fecha,
        time: detectedData.hora,
        limit: 3,
      });

      if (!nearestAvailability.exactMatch) {
        const retryDetectedData = {
          ...detectedData,
          hora: undefined,
          horaAmbigua: undefined,
        };
        const nearestTimesText = nearestAvailability.nearestTimes.join(", ");

        return finalizeReply({
          intent,
          branch: "disponibilidad",
          status: "en-curso",
          reply:
            nearestAvailability.nearestTimes.length > 0
              ? language === "en"
                ? `I checked Playtomic and the ${displayDate} slot at ${detectedData.hora} is no longer available because it is currently full. The closest free times I can offer are ${nearestTimesText}. If one works for you, I can prepare the booking.`
                : `He mirado Playtomic y la franja de ${displayDate} a las ${detectedData.hora} ya no esta disponible porque ahora mismo esta completa. Las horas libres mas cercanas que te puedo ofrecer son ${nearestTimesText}. Si te encaja una, te preparo la reserva.`
              : language === "en"
                ? `I checked Playtomic and the ${displayDate} slot at ${detectedData.hora} is no longer available because it is currently full. If you want, I can look for another time slot or another date.`
                : `He mirado Playtomic y la franja de ${displayDate} a las ${detectedData.hora} ya no esta disponible porque ahora mismo esta completa. Si quieres, te busco otro hueco en otra franja o en otra fecha.`,
          suggestedActions:
            nearestAvailability.nearestTimes.length > 0
              ? ["Elegir hora cercana", "Ver mas huecos", "Cambiar de dia"]
              : ["Buscar otra franja", "Cambiar de dia", "Abrir Playtomic"],
          actionButtons:
            nearestAvailability.nearestTimes.length > 0
              ? buildAvailabilityLookupActions(detectedData.fecha, nearestAvailability.nearestTimes)
              : await buildReservationActions("disponibilidad", retryDetectedData),
          missingFields: [],
          detectedData: retryDetectedData,
          confidence: "alta",
        }, language);
      }
    }

    if (branch === "disponibilidad" && isAvailabilityLookupMessage(message) && !detectedData.hora && !detectedData.horaAmbigua) {
      if (!detectedData.fecha) {
        return finalizeReply({
          intent,
          branch,
          status: "esperando-cliente",
          reply:
            language === "en"
              ? "I can check the real free slots in Playtomic, but I need you to tell me which day you want me to check."
              : "Puedo mirar los huecos reales en Playtomic, pero necesito que me digas para qué día quieres la disponibilidad.",
          suggestedActions: ["Pedir fecha", "Consultar disponibilidad", "Seguir con reserva"],
          actionButtons: await buildReservationActions(branch, detectedData),
          missingFields: ["fecha"],
          detectedData,
          confidence: "media",
        }, language);
      }

      const availableTimes = await getPlaytomicAvailableTimes({
        date: detectedData.fecha,
        period: requestedPeriod,
        limit: 8,
      });

      if (availableTimes.length > 0) {
        const periodSuffix = requestedPeriod ? ` ${requestedPeriod}` : "";

        return finalizeReply({
          intent,
          branch,
          status: "en-curso",
          reply:
            language === "en"
              ? `I checked the real free slots in Playtomic for ${displayDate}${periodSuffix}. Right now I can see these times available: ${availableTimes.join(", ")}. If one works for you, I can prepare the booking right away.`
              : `He mirado los huecos reales en Playtomic para ${displayDate}${periodSuffix}. Ahora mismo veo libres estas horas: ${availableTimes.join(", ")}. Si te encaja una, te preparo la reserva directamente.`,
          suggestedActions: ["Elegir una hora", "Seguir con reserva", "Abrir Playtomic"],
          actionButtons: buildAvailabilityLookupActions(detectedData.fecha, availableTimes),
          missingFields: [],
          detectedData,
          confidence: "alta",
        }, language);
      }

      return finalizeReply({
        intent,
        branch,
        status: "en-curso",
        reply:
          language === "en"
            ? `I checked the real availability in Playtomic for ${displayDate}${requestedPeriod ? ` ${requestedPeriod}` : ""}, but right now I cannot see free slots in that time range. If you want, I can suggest a nearby time or we can try another date.`
            : `He mirado la disponibilidad real en Playtomic para ${displayDate}${requestedPeriod ? ` ${requestedPeriod}` : ""}, pero ahora mismo no veo huecos libres en esa franja. Si quieres, te propongo otra hora cercana o lo intentamos en otra fecha.`,
        suggestedActions: ["Buscar otra franja", "Cambiar de dia", "Abrir Playtomic"],
        actionButtons: await buildReservationActions(branch, detectedData),
        missingFields: [],
        detectedData,
        confidence: "alta",
      }, language);
    }

    if (branch === "confirmacion-reserva") {
      return finalizeReply({
        intent,
        branch,
        status: missingFields.length > 0 ? "esperando-cliente" : "en-curso",
        reply:
          requestedIndoorCourt
            ? language === "en"
              ? `I can help with the booking, but ${clubKnowledge.clubName} does not have indoor courts. If ${defaultCourtLabel}${displayDate ? ` for ${displayDate}` : ""}${detectedData.hora ? ` at ${detectedData.hora}` : ""} works for you, I will continue with the confirmation and lock the best available slot.`
              : `Te ayudo con la reserva, pero en ${clubKnowledge.clubName} no hay pistas indoor. Si te encaja ${defaultCourtLabel}${displayDate ? ` para ${displayDate}` : ""}${detectedData.hora ? ` a las ${detectedData.hora}` : ""}, sigo con la confirmacion y bloqueo la mejor franja disponible.`
            : missingFields.length > 0
              ? language === "en"
                ? `I can close the booking, but I still need ${localizeMissingFields(missingFields, language).join(", ")} to prepare it without mistakes.`
                : `Puedo cerrar la reserva, pero todavia necesito ${missingFields.join(", ")} para dejarla preparada sin errores.`
              : language === "en"
                ? `Perfect. I already have a fairly defined booking${displayDate ? ` for ${displayDate}` : ""}${detectedData.hora ? ` at ${detectedData.hora}` : ""}. The only next step is to pay in Playtomic to lock the slot.`
                : `Perfecto. Ya tengo una reserva bastante definida${displayDate ? ` para ${displayDate}` : ""}${detectedData.hora ? ` a las ${detectedData.hora}` : ""}. El siguiente y unico paso es pagarla en Playtomic para bloquear la franja.`,
        suggestedActions: ["Pagar en Playtomic"],
        actionButtons: await buildReservationActions(branch, detectedData),
        missingFields,
        detectedData,
        confidence: missingFields.length > 1 ? "media" : "alta",
      }, language);
    }

    return finalizeReply({
      intent,
      branch,
      status: "en-curso" as const,
      reply:
        requestedIndoorCourt
          ? language === "en"
            ? `I can help with the booking, but ${clubKnowledge.clubName} does not have indoor courts. I have already detected ${[
                displayDate,
                detectedData.hora,
              ]
                .filter(Boolean)
                .join(", ") || "part of the request"}. If ${defaultCourtLabel} works for you, I can suggest two equivalent slots without restarting the process.`
            : `Puedo ayudarte con la reserva, pero en ${clubKnowledge.clubName} no hay pistas indoor. Ya he detectado ${[
                displayDate,
                detectedData.hora,
              ]
                .filter(Boolean)
                .join(", ") || "parte de la solicitud"}. Si te sirve ${defaultCourtLabel}, te propongo dos huecos equivalentes sin rehacer la gestion.`
          : detectedData.horaAmbigua
            ? language === "en"
              ? `I understood that you want to book${displayDate ? ` for ${displayDate}` : ""} and that the time is ${displayAmbiguousTime?.replace(" o ", " or ")}. To prepare the Playtomic link correctly, I need you to confirm which of the two times you prefer.`
              : `He entendido que quieres reservar${displayDate ? ` para ${displayDate}` : ""} y que la hora es ${displayAmbiguousTime?.replace(
                  " o ",
                  " o las ",
                )}. Para dejarte el enlace de Playtomic bien configurado necesito que confirmes cual de las dos horas prefieres.`
          : missingFields.length > 0
            ? language === "en"
              ? `I can help with the booking. I have already detected ${[
                  formatDisplayText(detectedData.actividad, language),
                  displayDate,
                  detectedData.hora,
                ]
                  .filter(Boolean)
                  .join(", ") || "part of the request"}. To suggest exact slots, I still need ${localizeMissingFields(missingFields, language).join(", ")}.`
              : `Puedo ayudarte con la reserva. Ya he detectado ${[
                  detectedData.actividad,
                  displayDate,
                  detectedData.hora,
                ]
                  .filter(Boolean)
                  .join(", ") || "parte de la solicitud"}. Para proponerte huecos exactos me faltan ${missingFields.join(", ")}.`
            : language === "en"
              ? `I already have the key booking details${displayDate ? ` for ${displayDate}` : ""}${detectedData.hora ? ` at ${detectedData.hora}` : ""}. I can suggest two nearby slots and, if one works for you, send you the Playtomic link with the booking already prepared.`
              : `Ya tengo los datos clave de la reserva${displayDate ? ` para ${displayDate}` : ""}${detectedData.hora ? ` a las ${detectedData.hora}` : ""}. Puedo proponerte dos huecos cercanos y, si te encaja, enviarte el enlace de Playtomic con la reserva ya configurada.`,
      suggestedActions: ["Verificar disponibilidad", "Crear pre-reserva", "Enviar link de Playtomic"],
      actionButtons: await buildReservationActions(branch, detectedData),
      missingFields,
      detectedData,
      confidence: missingFields.length > 1 ? "media" : "alta",
    }, language);
  }

  if (intent === "cambio-clase") {
    const branch = detectChangeBranch(message, context?.branch);
    const displayCurrentSlot = formatDisplayText(detectedData.franjaActual, language);
    const displayTargetSlot = formatDisplayText(detectedData.nuevaFranja, language);

    const changeSummary = [
      displayCurrentSlot ? language === "en" ? `from ${displayCurrentSlot}` : `de ${displayCurrentSlot}` : undefined,
      displayTargetSlot ? language === "en" ? `to ${displayTargetSlot}` : `a ${displayTargetSlot}` : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return finalizeReply({
      intent,
      branch,
      status: missingFields.length > 0 ? "esperando-cliente" : "en-curso",
      reply: appendKnowledgeSupplement(
        branch === "recuperacion-clase"
          ? language === "en"
            ? `I can help you reschedule or recover the class${detectedData.franjaActual ? ` ${changeSummary}` : ""}. I need to know whether you want another session, to compensate it with a pass, or to leave it pending for team review.`
            : `Puedo ayudarte a recolocar o recuperar la clase${detectedData.franjaActual ? ` ${changeSummary}` : ""}. Necesito saber si quieres otra sesion, compensarlo con bono o dejarlo pendiente para revision del equipo.`
          : missingFields.length > 0
            ? language === "en"
              ? `I understood part of the change${changeSummary ? ` ${changeSummary}` : ""}. To prepare it properly, I still need ${localizeMissingFields(missingFields, language).join(", ")} so I do not ask you for the same information twice.`
              : `He entendido parte del cambio${changeSummary ? ` ${changeSummary}` : ""}. Para dejarlo bien preparado todavia necesito ${missingFields.join(", ")} y asi no pedirte datos dos veces.`
            : language === "en"
              ? `I understood that you want to move the class ${changeSummary}. I can check an equivalent slot, leave the request ready for validation, and notify the manager without losing context.`
              : `He entendido que quieres mover la clase ${changeSummary}. Puedo comprobar hueco equivalente, dejar la solicitud lista para validacion y avisar al responsable sin perder el contexto.`,
        context?.knowledgeSnippets,
        language,
      ),
      suggestedActions: ["Recoger nueva franja", "Avisar al responsable", "Actualizar seguimiento en CRM"],
      actionButtons: buildChangeActions(branch, detectedData),
      missingFields,
      detectedData,
      confidence: missingFields.length > 0 ? "media" : "alta",
    }, language);
  }

  if (intent === "cobro") {
    const branch = detectBillingBranch(message, context?.branch);

    return finalizeReply({
      intent,
      branch,
      status: "esperando-cliente" as const,
      reply: appendKnowledgeSupplement(
        branch === "factura"
          ? detectedData.asuntoCobro === "factura"
            ? language === "en"
              ? "I can help you with the invoice. I already understand that this request is about billing, so I can ask for billing details, confirm whether it is for the last booking, or leave it ready for administration."
              : "Te ayudo con la factura. Ya entiendo que esta gestion va por facturacion, asi que puedo pedir datos fiscales, confirmar si es de la ultima reserva o dejarlo listo para administracion."
            : language === "en"
              ? "I can help you with the invoice. If you confirm whether it is for the last booking or for a pass, I will tell you the next step and leave the request prepared."
              : "Te ayudo con la factura. Si me confirmas si es de la ultima reserva o de un bono, te digo el siguiente paso y dejo la gestion preparada."
          : language === "en"
            ? "I can help you with the billing issue. I can review a charge, clarify prices, or leave the incident ready for administration."
            : "Te ayudo con la gestion economica. Puedo revisar un cobro, aclarar precios o dejar la incidencia lista para administracion.",
        context?.knowledgeSnippets,
        language,
      ),
      suggestedActions: ["Consultar facturacion", "Preparar factura", "Escalar a administracion"],
      actionButtons: buildBillingActions(branch),
      missingFields,
      detectedData,
      confidence: detectedData.asuntoCobro ? "alta" : "media",
    }, language);
  }

  const branch = detectInfoBranch(message, context?.branch);

  return finalizeReply({
    intent,
    branch,
    status: "resuelto" as const,
    reply: appendKnowledgeSupplement(
      branch === "bonos"
        ? language === "en"
          ? "I can explain the available passes and guide you to the option that fits ranking, tournaments, or classes best."
          : "Puedo explicarte los bonos disponibles y llevarte a la opcion que encaja mejor con ranking, torneo o clases."
        : branch === "torneos"
          ? language === "en"
            ? "I can guide you about tournaments, ranking, and the steps to register or request follow-up."
            : "Puedo orientarte sobre torneos, ranking y pasos para inscribirte o pedir seguimiento."
          : branch === "clases"
            ? language === "en"
              ? "I can explain class formats, levels, and the next step to book or request an assessment."
              : "Puedo explicarte modalidades de clase, niveles y siguiente paso para reservar o pedir valoracion."
            : language === "en"
              ? "I can help you with bookings, changes, payments, or general information. If you tell me your exact goal, I will guide you step by step and leave the conversation ready for the CRM."
              : "Puedo ayudarte con reservas, cambios, pagos o informacion general. Si me dices el objetivo concreto, te guio paso a paso y dejo la conversacion preparada para el CRM.",
      context?.knowledgeSnippets,
      language,
    ),
    suggestedActions: ["Responder FAQ", "Clasificar consulta", "Actualizar ultimo contacto"],
    actionButtons: buildInfoActions(branch),
    missingFields,
    detectedData,
    confidence: detectedData.temaInformativo ? "alta" : "media",
  }, language);
}
