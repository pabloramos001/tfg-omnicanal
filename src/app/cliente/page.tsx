import Link from "next/link";

import { CustomerChatWidget } from "./customer-chat-widget";

const serviceCards = [
  {
    title: "Reservar pista en minutos",
    description: "El cliente indica dia y hora. El asistente propone huecos y deja la reserva preparada para una pista doble.",
  },
  {
    title: "Cambiar una clase sin llamadas",
    description: "Puede mover una sesion, pedir recuperacion o dejar la solicitud lista para revision del equipo.",
  },
  {
    title: "Resolver cobros y facturas",
    description: "Factura, revision de cargos o consulta de precios con un flujo claro y sin perder el hilo.",
  },
  {
    title: "Informarse sobre bonos y torneos",
    description: "El cliente recibe una orientacion rapida sobre bonos, ranking, torneos y modalidades de clase.",
  },
];

const experienceSteps = [
  {
    step: "01",
    title: "Escribe al asistente",
    description: "Desde web o WhatsApp, el cliente plantea su necesidad con lenguaje natural.",
  },
  {
    step: "02",
    title: "El sistema entiende la gestion",
    description: "Detecta si es reserva, cambio, cobro o consulta, y pide solo lo que falta.",
  },
  {
    step: "03",
    title: "Propone acciones claras",
    description: "Muestra botones para avanzar por cada ramificacion sin depender de texto libre.",
  },
  {
    step: "04",
    title: "Confirma o escala",
    description: "Si el caso es sencillo lo deja listo; si no, lo pasa al equipo con contexto completo.",
  },
];

const customerMoments = [
  "Reservar una pista para hoy o para el fin de semana.",
  "Cambiar una clase a otra franja o recuperar una sesion.",
  "Pedir factura o revisar un cobro sin repetir datos.",
  "Consultar bonos, ranking, torneos y actividades disponibles.",
];

const faqs = [
  {
    question: "Que puede hacer el asistente ahora mismo?",
    answer:
      "Puede guiar reservas, cambios de clase, consultas de cobro y preguntas informativas, dejando la gestion lista o derivandola con contexto.",
  },
  {
    question: "Tengo que escribir todo manualmente?",
    answer:
      "No. La experiencia esta pensada para avanzar con botones de accion segun la rama detectada en cada conversacion.",
  },
  {
    question: "Y si mi caso es mas complejo?",
    answer:
      "El asistente recoge los datos clave y escala la conversacion al equipo para evitar bloqueos o perdida de informacion.",
  },
];

export default function ClientePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(93,136,196,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(184,208,238,0.45),_transparent_24%),linear-gradient(180deg,_#f7f4ee_0%,_#f1ecdf_42%,_#ebe3d6_100%)] px-6 py-8 text-stone-900 sm:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2.2rem] border border-white/70 bg-white/72 p-8 shadow-[0_28px_90px_rgba(53,42,31,0.12)] backdrop-blur-md sm:p-10 lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex w-fit rounded-full border border-[#5d88c4]/20 bg-[#5d88c4]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#355986]">
              Vista cliente
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl">
                Reserva, cambia o resuelve tu gestion sin esperas ni llamadas.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                Esta es la vista publica orientada al cliente final: una experiencia simple para reservar pista, mover clases, pedir facturas o consultar bonos con ayuda del asistente.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex rounded-full bg-[#5d88c4] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(93,136,196,0.28)]">
                Chat integrado abajo a la izquierda
              </span>
              <Link
                href="/"
                className="inline-flex rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-[#5d88c4] hover:text-[#355986]"
              >
                Volver a la demo interna
              </Link>
            </div>
          </div>

          <aside className="grid min-w-[300px] max-w-[360px] gap-4 rounded-[2rem] bg-stone-950 p-6 text-stone-50 shadow-[0_18px_48px_rgba(28,25,23,0.24)]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#b8d0ee]">Experiencia esperada</p>
              <p className="mt-3 text-3xl font-semibold">Rapida, clara y guiada</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Disponible</p>
                <p className="mt-2 text-2xl font-semibold">24/7</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Canales</p>
                <p className="mt-2 text-2xl font-semibold">Web + WhatsApp</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Seguimiento</p>
                <p className="mt-2 text-2xl font-semibold">Con contexto</p>
              </div>
            </div>
            <div className="rounded-[1.6rem] bg-[#5d88c4] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-[#eef4fb]">Lo que nota el cliente</p>
              <p className="mt-3 text-sm leading-7">
                Menos friccion para reservar, menos mensajes repetidos y un siguiente paso claro en cada conversacion.
              </p>
            </div>
          </aside>
        </div>

        <section className="grid gap-4 lg:grid-cols-4">
          {serviceCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.6rem] border border-stone-200 bg-stone-50/90 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)]"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[#355986]/70">Cliente final</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-900">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-stone-700">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[1.9rem] border border-stone-200 bg-white/85 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#355986]/70">Como se vive</p>
            <h2 className="mt-3 text-3xl font-semibold">El recorrido del cliente en la pagina</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {experienceSteps.map((item) => (
                <article key={item.step} className="rounded-[1.5rem] border border-stone-200 bg-stone-50/75 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5d88c4]">{item.step}</p>
                  <h3 className="mt-3 text-xl font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-700">{item.description}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[1.9rem] border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-[0_18px_48px_rgba(28,25,23,0.2)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#b8d0ee]">Acciones frecuentes</p>
            <h2 className="mt-3 text-3xl font-semibold">Lo que puede pedir el cliente</h2>
            <div className="mt-6 space-y-3">
              {customerMoments.map((moment) => (
                <div key={moment} className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-stone-200">
                  {moment}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[1.9rem] border border-stone-200 bg-[#5d88c4] p-6 text-white shadow-[0_16px_36px_rgba(93,136,196,0.24)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#eef4fb]">Llamada a la accion</p>
            <h2 className="mt-3 text-3xl font-semibold">Esta seria la entrada publica al asistente</h2>
            <p className="mt-4 max-w-xl text-sm leading-8 text-[#eef4fb]">
              Si quieres enseñar el producto a alguien externo, esta es la pagina que deberias abrir: comunica valor, evita datos internos y lleva al cliente directamente a conversar con el bot.
            </p>
            <Link
              href="#customer-chat-launcher"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#355986] transition hover:bg-[#f3f7fc]"
            >
              Ir al widget de chat
            </Link>
          </article>

          <article className="rounded-[1.9rem] border border-stone-200 bg-white/85 p-6 shadow-[0_10px_30px_rgba(87,83,78,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[#355986]/70">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-semibold">Dudas que resolveria esta pagina</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-[1.45rem] border border-stone-200 bg-stone-50/75 p-5">
                  <h3 className="text-lg font-semibold text-stone-900">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-700">{faq.answer}</p>
                </article>
              ))}
            </div>
          </article>
        </section>
      </section>
      <CustomerChatWidget />
    </main>
  );
}