# Demo Omnicanal

Base inicial para una demo de automatizacion de procesos y atencion omnicanal con CRM, formularios, WhatsApp e IA.

## Stack

- Next.js 16
- TypeScript
- App Router
- Tailwind CSS v4

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run start`

## Objetivo de esta base

Esta primera iteracion deja listo el entorno para evolucionar la demo hacia:

- workflows de formularios a CRM
- bandeja de mensajes omnicanal
- automatizaciones de seguimiento
- clasificacion y sugerencias con IA

## Bot mas listo

La demo ya incluye tres piezas para evolucionar el agente sin rehacer la base:

- base de conocimiento del club en `src/lib/club-knowledge.ts`
- dataset inicial de entrenamiento y evaluacion en `src/lib/agent-training-dataset.ts`
- guia de arquitectura para migrar a LLM + reglas en `docs/agent-llm-architecture.md`

El endpoint `GET /api/ai/agent` expone un resumen de la base de conocimiento y del dataset para poder inspeccionar rapidamente el estado del agente.

## Sincronizacion con Google Drive

La demo puede sincronizar una carpeta de Google Drive para reutilizar documentos como contexto del chatbot en consultas informativas.

- configura las variables del fichero `.env.example`
- comparte la carpeta de Drive con el correo de la service account
- lanza `POST /api/google-drive/sync` para importar documentos
- consulta `GET /api/google-drive/sync` para ver el estado del ultimo sync

Version inicial soportada:

- Google Docs
- Google Sheets exportadas como CSV
- archivos `txt`, `md`, `csv` y `json`

Las respuestas de reserva siguen resolviendose con reglas y Playtomic. El material sincronizado se usa como apoyo en informacion general, clases y temas similares.

## Integracion con Make

El endpoint `POST /api/ai/agent` ya se puede conectar directamente desde Make.

- envias `message` y, si la conversacion ya venia de un paso anterior, tambien `context`
- el backend devuelve `reply` para reenviar al usuario
- devuelve `nextContext` listo para guardar en Data Store, CRM o variable de escenario
- devuelve `automation` con banderas utiles para ramificar el flujo en Make

Campos especialmente utiles en Make:

- `reply`: texto que puedes devolver al canal
- `nextContext`: contexto listo para reutilizar en el siguiente mensaje
- `missingFields`: datos que el agente aun necesita
- `detectedData`: datos ya extraidos por el agente
- `actionButtons`: siguientes acciones sugeridas
- `automation.waitingForCustomer`: el bot necesita mas datos del usuario
- `automation.shouldEscalate`: conviene escalar a humano
- `automation.isResolved`: la gestion puede darse por cerrada

Hay una guia paso a paso en `docs/make-integration.md`.

## Nota de entorno

Si acabas de instalar Node.js en Windows, puede que necesites abrir una terminal nueva para que `node`, `npm` y `npx` entren en el `PATH` global.