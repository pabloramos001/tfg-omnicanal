"use client";

import { useEffect, useState } from "react";

type ReservationCalendarResponse = {
  selectedDate: string;
  slots: {
    time: string;
    availableCourts: number;
    duration: number;
    reserveUrl: string;
  }[];
  clubUrl: string;
  openingHours: {
    opensAt: string;
    closesAt: string;
  };
  error?: string;
};

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildUpcomingDates(totalDays: number) {
  return Array.from({ length: totalDays }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return formatDateForInput(date);
  });
}

function formatDayLabel(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-ES", options).format(new Date(`${value}T12:00:00`));
}

function capitalizeLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ReservationCalendar() {
  const [calendarDays] = useState(() => buildUpcomingDates(7));
  const [selectedDate, setSelectedDate] = useState(() => calendarDays[0] ?? formatDateForInput(new Date()));
  const [availability, setAvailability] = useState<ReservationCalendarResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/playtomic/availability?date=${encodeURIComponent(selectedDate)}`, {
          signal: abortController.signal,
          cache: "no-store",
        });

        const data = (await response.json()) as ReservationCalendarResponse;

        if (!response.ok || data.error) {
          throw new Error(data.error ?? "No se pudo cargar la disponibilidad.");
        }

        setAvailability(data);
      } catch (fetchError) {
        if (abortController.signal.aborted) {
          return;
        }

        setAvailability(null);
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar la disponibilidad.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      abortController.abort();
    };
  }, [selectedDate]);

  return (
    <section
      id="booking-calendar"
      className="grid gap-6 rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(239,245,252,0.96)_100%)] p-6 shadow-[0_18px_52px_rgba(87,83,78,0.08)] sm:p-8 lg:grid-cols-[0.92fr_1.08fr]"
    >
      <article className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#355986]/70">Calendario de reservas</p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-900">Consulta la disponibilidad y reserva en Playtomic</h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-stone-700">
            Elige una fecha, revisa los huecos con pistas disponibles y salta al Playtomic del club para cerrar la reserva.
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-stone-200 bg-stone-50/90 p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500" htmlFor="reservation-date">
            Fecha
          </label>
          <input
            id="reservation-date"
            type="date"
            value={selectedDate}
            min={calendarDays[0]}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 outline-none transition focus:border-[#5d88c4]"
          />
          <div className="flex flex-wrap gap-2">
            {calendarDays.map((day) => {
              const isSelected = day === selectedDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`rounded-[1.2rem] border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-[#5d88c4] bg-[#5d88c4] text-white shadow-[0_10px_24px_rgba(93,136,196,0.24)]"
                      : "border-stone-300 bg-white text-stone-700 hover:border-[#5d88c4] hover:text-[#355986]"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-[0.18em] opacity-80">
                    {capitalizeLabel(formatDayLabel(day, { weekday: "short" }).replace(".", ""))}
                  </span>
                  <span className="mt-1 block text-lg font-semibold">{formatDayLabel(day, { day: "2-digit", month: "2-digit" })}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-stone-950 p-5 text-stone-50 shadow-[0_16px_40px_rgba(28,25,23,0.16)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#b8d0ee]">Operacion</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Horario</p>
              <p className="mt-2 text-xl font-semibold">
                {availability?.openingHours.opensAt ?? "--:--"} - {availability?.openingHours.closesAt ?? "--:--"}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Cierre de reserva</p>
              <p className="mt-2 text-xl font-semibold">En Playtomic</p>
            </div>
          </div>
          <a
            href={availability?.clubUrl ?? "https://playtomic.com"}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-[#5d88c4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#4d77b1]"
          >
            Abrir club en Playtomic
          </a>
        </div>
      </article>

      <article className="rounded-[1.7rem] border border-stone-200 bg-white/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:p-6">
        <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#355986]/70">Huecos disponibles</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-900">
              {capitalizeLabel(formatDayLabel(selectedDate, { weekday: "long", day: "numeric", month: "long" }))}
            </h3>
          </div>
          <p className="text-sm leading-7 text-stone-600">Cada boton te lleva al Playtomic del club con la franja preparada.</p>
        </div>

        {isLoading ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[1.4rem] border border-stone-200 bg-stone-100/80" />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-5 rounded-[1.4rem] border border-[#d6b27e] bg-[#fff4df] p-5 text-sm leading-7 text-stone-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && availability && availability.slots.length === 0 ? (
          <div className="mt-5 rounded-[1.4rem] border border-stone-200 bg-stone-50/90 p-5 text-sm leading-7 text-stone-700">
            No aparecen huecos para esa fecha ahora mismo. Puedes abrir el club en Playtomic para revisar otras franjas o volver a intentarlo en unos minutos.
          </div>
        ) : null}

        {!isLoading && !error && availability && availability.slots.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {availability.slots.map((slot) => (
              <a
                key={`${availability.selectedDate}-${slot.time}`}
                href={slot.reserveUrl}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.5rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(247,250,254,1)_0%,rgba(255,255,255,1)_100%)] p-4 transition hover:-translate-y-0.5 hover:border-[#5d88c4] hover:shadow-[0_12px_30px_rgba(93,136,196,0.16)]"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#355986]/70">Pistas libres</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold text-stone-900">{slot.time}</p>
                  <span className="rounded-full bg-[#5d88c4]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#355986]">
                    {slot.availableCourts} disponibles
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-700">Duracion sugerida: {slot.duration} min. La reserva se completa en Playtomic.</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-[#355986] transition group-hover:text-[#26476f]">
                  Reservar esta franja
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}