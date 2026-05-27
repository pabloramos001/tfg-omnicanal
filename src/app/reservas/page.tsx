import Link from "next/link";

import { ReservationCalendar } from "@/app/cliente/reservation-calendar";

export default function ReservasPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(93,136,196,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(184,208,238,0.45),_transparent_24%),linear-gradient(180deg,_#f7f4ee_0%,_#f1ecdf_42%,_#ebe3d6_100%)] px-6 py-8 text-stone-900 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2.2rem] border border-white/70 bg-white/72 p-8 shadow-[0_28px_90px_rgba(53,42,31,0.12)] backdrop-blur-md sm:p-10 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex w-fit rounded-full border border-[#5d88c4]/20 bg-[#5d88c4]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#355986]">
              Reservas online
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl">
              Consulta disponibilidad y reserva tu pista en una pagina dedicada.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              Esta vista concentra el calendario de reservas para compartirlo como enlace directo con clientes o usarlo como acceso rapido desde campanas, QR o WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/cliente"
              className="inline-flex rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-[#5d88c4] hover:text-[#355986]"
            >
              Volver a la vista cliente
            </Link>
            <Link
              href="/#customer-chat-launcher"
              className="inline-flex rounded-full bg-[#5d88c4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(93,136,196,0.28)] transition hover:bg-[#4d77b1]"
            >
              Abrir asistente
            </Link>
          </div>
        </div>

        <ReservationCalendar />
      </section>
    </main>
  );
}