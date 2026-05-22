export type ClubKnowledge = {
  clubName: string;
  channels: string[];
  reservations: {
    indoorCourtsAvailable: boolean;
    availableCourtTypes: string[];
    defaultCourtTypeLabel: string;
    defaultPlayersPerBooking: number;
    minimumBookingDurationMinutes: number;
    preferredBookingDurationMinutes: number;
    opensAt: string;
    closesAt: string;
    unsupportedRequests: string[];
    playtomic: {
      baseUrl: string;
      clubPath: string;
      defaultSport: string;
      availabilitySportId: string;
      tenantId: string;
      timezone: string;
    };
  };
  classes: {
    allowsRescheduleRequests: boolean;
    allowsRecoveryRequests: boolean;
    escalationTriggers: string[];
  };
  billing: {
    supportedFlows: string[];
    requiredInvoiceData: string[];
  };
  assistant: {
    supportedIntents: string[];
    primaryGoal: string;
  };
};

export const clubKnowledge: ClubKnowledge = {
  clubName: "Demo Omnicanal Club",
  channels: ["web", "WhatsApp"],
  reservations: {
    indoorCourtsAvailable: false,
    availableCourtTypes: ["exterior"],
    defaultCourtTypeLabel: "Pista exterior",
    defaultPlayersPerBooking: 4,
    minimumBookingDurationMinutes: 60,
    preferredBookingDurationMinutes: 90,
    opensAt: "08:00",
    closesAt: "23:30",
    unsupportedRequests: ["pista indoor", "pista cubierta", "pista techada"],
    playtomic: {
      baseUrl: "https://playtomic.com",
      clubPath: "clubs/padel-portitxol",
      defaultSport: "padel",
      availabilitySportId: "PADEL",
      tenantId: "4d2971a0-ad26-4fd0-bb28-fe80d78a98fd",
      timezone: "Europe/Madrid",
    },
  },
  classes: {
    allowsRescheduleRequests: true,
    allowsRecoveryRequests: true,
    escalationTriggers: ["grupo cerrado", "afecta a varios jugadores", "bono activo con conflicto"],
  },
  billing: {
    supportedFlows: ["factura", "revision de cobro", "consulta de precios"],
    requiredInvoiceData: ["datos fiscales", "referencia de la reserva o bono"],
  },
  assistant: {
    supportedIntents: ["reserva", "cambio-clase", "cobro", "informacion"],
    primaryGoal: "Guiar gestiones frecuentes sin perder contexto y escalar cuando haga falta.",
  },
};

export const clubKnowledgeSummary = {
  clubName: clubKnowledge.clubName,
  channels: clubKnowledge.channels,
  supportedIntents: clubKnowledge.assistant.supportedIntents,
  reservationFacts: [
    clubKnowledge.reservations.indoorCourtsAvailable ? "Hay pistas indoor" : "No hay pistas indoor",
    `Tipo principal: ${clubKnowledge.reservations.defaultCourtTypeLabel}`,
  ],
  billingFacts: clubKnowledge.billing.requiredInvoiceData,
};

export function getDefaultCourtTypeLabel() {
  return clubKnowledge.reservations.defaultCourtTypeLabel;
}

export function supportsIndoorCourts() {
  return clubKnowledge.reservations.indoorCourtsAvailable;
}

export function getDefaultPlayersPerBooking() {
  return clubKnowledge.reservations.defaultPlayersPerBooking;
}

export function getMinimumBookingDurationMinutes() {
  return clubKnowledge.reservations.minimumBookingDurationMinutes;
}

export function getPreferredBookingDurationMinutes() {
  return clubKnowledge.reservations.preferredBookingDurationMinutes;
}

function convertTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return undefined;
  }

  return hours * 60 + minutes;
}

export function isReservationTimeWithinOpeningHours(time: string) {
  const currentMinutes = convertTimeToMinutes(time);
  const opensAtMinutes = convertTimeToMinutes(clubKnowledge.reservations.opensAt);
  const closesAtMinutes = convertTimeToMinutes(clubKnowledge.reservations.closesAt);

  if (currentMinutes === undefined || opensAtMinutes === undefined || closesAtMinutes === undefined) {
    return true;
  }

  return currentMinutes >= opensAtMinutes && currentMinutes <= closesAtMinutes;
}

function matchesTimePeriod(time: string, period?: string) {
  if (!period) {
    return true;
  }

  const currentMinutes = convertTimeToMinutes(time);

  if (currentMinutes === undefined) {
    return false;
  }

  if (period === "por la manana") {
    return currentMinutes < 15 * 60;
  }

  if (period === "por la tarde") {
    return currentMinutes >= 15 * 60 && currentMinutes < 21 * 60;
  }

  if (period === "por la noche") {
    return currentMinutes >= 21 * 60;
  }

  return true;
}

function normalizeDateKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const calendarMonthMap: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function formatIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function resolveReservationDate(dateText: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return dateText;
  }

  const normalizedDate = normalizeDateKey(dateText);
  const today = new Date();
  const calendarDateMatch = normalizedDate.match(/^(\d{1,2})(?:\s+de)?\s+([a-z]+)(?:\s+de\s+(\d{4}))?$/);
  const weekdayMap: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  if (calendarDateMatch) {
    const [, dayText, monthText, yearText] = calendarDateMatch;
    const month = calendarMonthMap[monthText];
    const day = Number(dayText);

    if (month !== undefined && !Number.isNaN(day)) {
      const year = yearText ? Number(yearText) : today.getFullYear();
      const result = new Date(year, month, day);

      if (!yearText && result < today) {
        result.setFullYear(result.getFullYear() + 1);
      }

      return formatIsoDate(result);
    }
  }

  if (normalizedDate === "hoy") {
    return formatIsoDate(today);
  }

  if (normalizedDate === "manana") {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return formatIsoDate(tomorrow);
  }

  const targetWeekday = weekdayMap[normalizedDate];

  if (targetWeekday === undefined) {
    return undefined;
  }

  const result = new Date(today);
  const daysUntilTarget = (targetWeekday - today.getDay() + 7) % 7;
  result.setDate(today.getDate() + daysUntilTarget);

  return formatIsoDate(result);
}

type PlaytomicReservationLinkOptions = {
  date?: string;
  time?: string;
  players?: number;
  courtType?: string;
};

type PlaytomicAvailabilitySlot = {
  start_time: string;
  duration: number;
  price?: string;
};

type PlaytomicAvailabilityResource = {
  resource_id: string;
  start_date: string;
  slots: PlaytomicAvailabilitySlot[];
};

function buildPlaytomicClubLink(options: PlaytomicReservationLinkOptions, resolvedDate: string) {
  const params = new URLSearchParams({
    date: resolvedDate,
    startTime: options.time ?? "",
    players: String(options.players ?? clubKnowledge.reservations.defaultPlayersPerBooking),
    courtType: options.courtType ?? clubKnowledge.reservations.availableCourtTypes[0] ?? "exterior",
    sport: clubKnowledge.reservations.playtomic.defaultSport,
    source: "demo-omnicanal",
  });

  return `${clubKnowledge.reservations.playtomic.baseUrl}/${clubKnowledge.reservations.playtomic.clubPath}?${params.toString()}`;
}

function formatUtcIsoWithoutMilliseconds(value: Date) {
  return value.toISOString().replace(".000Z", "Z");
}

function getLocalTimeLabelFromUtc(date: string, utcTime: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(`${date}T${utcTime}Z`));
}

async function getPlaytomicUniqueTimes(date: string) {
  const resolvedDate = resolveReservationDate(date);

  if (!resolvedDate) {
    return [];
  }

  const availabilityUrl = new URL(`${clubKnowledge.reservations.playtomic.baseUrl}/api/clubs/availability`);
  availabilityUrl.searchParams.set("tenant_id", clubKnowledge.reservations.playtomic.tenantId);
  availabilityUrl.searchParams.set("date", resolvedDate);
  availabilityUrl.searchParams.set("sport_id", clubKnowledge.reservations.playtomic.availabilitySportId);

  const availabilityResponse = await fetch(availabilityUrl, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!availabilityResponse.ok) {
    return [];
  }

  const availability = (await availabilityResponse.json()) as PlaytomicAvailabilityResource[];

  return Array.from(
    new Set(
      availability.flatMap((resource) =>
        resource.slots.map((slot) =>
          getLocalTimeLabelFromUtc(resource.start_date, slot.start_time, clubKnowledge.reservations.playtomic.timezone),
        ),
      ),
    ),
  ).sort();
}

export async function getPlaytomicAvailableTimes(options: { date: string; period?: string; limit?: number }) {
  try {
    const uniqueTimes = (await getPlaytomicUniqueTimes(options.date)).filter((time) => matchesTimePeriod(time, options.period));

    return uniqueTimes.slice(0, options.limit ?? 8);
  } catch {
    return [];
  }
}

export async function getPlaytomicNearestAvailableTimes(options: { date: string; time: string; limit?: number }) {
  try {
    const uniqueTimes = await getPlaytomicUniqueTimes(options.date);
    const requestedMinutes = convertTimeToMinutes(options.time);

    if (requestedMinutes === undefined) {
      return {
        exactMatch: false,
        nearestTimes: [] as string[],
      };
    }

    const exactMatch = uniqueTimes.includes(options.time);

    if (exactMatch) {
      return {
        exactMatch: true,
        nearestTimes: [options.time],
      };
    }

    const nearestTimes = uniqueTimes
      .map((time) => ({
        time,
        distance: Math.abs((convertTimeToMinutes(time) ?? requestedMinutes) - requestedMinutes),
      }))
      .sort((left, right) => left.distance - right.distance || left.time.localeCompare(right.time))
      .slice(0, options.limit ?? 3)
      .map((entry) => entry.time);

    return {
      exactMatch: false,
      nearestTimes,
    };
  } catch {
    return {
      exactMatch: false,
      nearestTimes: [] as string[],
    };
  }
}

export async function buildPlaytomicReservationLink(options: PlaytomicReservationLinkOptions) {
  if (!options.date || !options.time) {
    return undefined;
  }

  const resolvedDate = resolveReservationDate(options.date);

  if (!resolvedDate) {
    return undefined;
  }

  const fallbackLink = buildPlaytomicClubLink(options, resolvedDate);

  try {
    const availabilityUrl = new URL(`${clubKnowledge.reservations.playtomic.baseUrl}/api/clubs/availability`);
    availabilityUrl.searchParams.set("tenant_id", clubKnowledge.reservations.playtomic.tenantId);
    availabilityUrl.searchParams.set("date", resolvedDate);
    availabilityUrl.searchParams.set("sport_id", clubKnowledge.reservations.playtomic.availabilitySportId);

    const availabilityResponse = await fetch(availabilityUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!availabilityResponse.ok) {
      return fallbackLink;
    }

    const availability = (await availabilityResponse.json()) as PlaytomicAvailabilityResource[];
    const matchingResource = availability.find((resource) =>
      resource.slots.some(
        (slot) =>
          getLocalTimeLabelFromUtc(resource.start_date, slot.start_time, clubKnowledge.reservations.playtomic.timezone) ===
          options.time,
      ),
    );

    const matchingSlots =
      matchingResource?.slots
        .filter(
          (slot) =>
            getLocalTimeLabelFromUtc(
              matchingResource.start_date,
              slot.start_time,
              clubKnowledge.reservations.playtomic.timezone,
            ) === options.time && slot.duration >= clubKnowledge.reservations.minimumBookingDurationMinutes,
        )
        .sort((left, right) => {
          const preferredDuration = clubKnowledge.reservations.preferredBookingDurationMinutes;
          const leftDistance = Math.abs(left.duration - preferredDuration);
          const rightDistance = Math.abs(right.duration - preferredDuration);

          return leftDistance - rightDistance || right.duration - left.duration;
        }) ?? [];

    const matchingSlot = matchingSlots[0];

    if (!matchingResource || !matchingSlot) {
      return fallbackLink;
    }

    const paymentParams = new URLSearchParams({
      type: "CUSTOMER_MATCH",
      tenant_id: clubKnowledge.reservations.playtomic.tenantId,
      resource_id: matchingResource.resource_id,
      start: formatUtcIsoWithoutMilliseconds(new Date(`${matchingResource.start_date}T${matchingSlot.start_time}Z`)),
      duration: String(matchingSlot.duration),
    });

    return `${clubKnowledge.reservations.playtomic.baseUrl}/api/web-app/payments?${paymentParams.toString()}`;
  } catch {
    return fallbackLink;
  }
}