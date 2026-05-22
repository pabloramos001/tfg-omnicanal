# Arquitectura objetivo del agente

## Estado actual

La demo usa un motor determinista basado en reglas en `src/lib/agent.ts`.

- Clasifica la intención.
- Extrae datos como fecha, hora y jugadores.
- Aplica restricciones del club.
- Devuelve una respuesta estructurada con botones de acción.

Eso es útil para la demo, pero limita la cobertura cuando el lenguaje del cliente se vuelve más ambiguo o más rico.

## Objetivo

Evolucionar a un agente híbrido: LLM + reglas + herramientas + conocimiento estructurado.

La idea no es sustituir las reglas del club por texto libre, sino separar responsabilidades:

1. El LLM interpreta lenguaje natural.
2. Las reglas del club validan restricciones reales.
3. Las herramientas ejecutan acciones seguras.
4. El dataset de evaluación mide si el comportamiento mejora o empeora.

## Capas recomendadas

### 1. Entrada conversacional

Archivos actuales:

- `src/app/agent/agent-chat.tsx`
- `src/app/cliente/customer-chat-widget.tsx`

Responsabilidad:

- capturar el mensaje del cliente
- mantener el contexto de la conversación
- mostrar botones y estado del flujo

### 2. Orquestador del agente

Archivo actual:

- `src/app/api/ai/agent/route.ts`

Responsabilidad futura:

- recibir el mensaje y el contexto
- decidir si usar reglas directas, LLM o herramientas
- devolver una respuesta consistente a la UI

### 3. Conocimiento del negocio

Archivo nuevo:

- `src/lib/club-knowledge.ts`

Responsabilidad:

- centralizar restricciones y hechos del club
- evitar reglas dispersas o hardcoded en múltiples ramas
- exponer información reutilizable para prompts, validación y tool calling

Ejemplos de hechos:

- no hay pistas indoor
- qué canales existen
- qué flujos admite facturación
- cuándo una gestión requiere escalado

### 4. Motor de decisión

Archivo actual:

- `src/lib/agent.ts`

Responsabilidad futura:

- seguir resolviendo casos simples por reglas
- delegar al LLM cuando el lenguaje sea ambiguo o cuando haya varias interpretaciones plausibles
- validar siempre la salida con la base de conocimiento antes de responder

### 5. Herramientas

Propuesta de herramientas futuras:

- `buscarDisponibilidad`
- `crearPreReserva`
- `registrarEnCRM`
- `crearTicketCobro`
- `escalarAResponsable`

El LLM no debe inventar el resultado de estas acciones. Debe invocar la herramienta adecuada y usar su salida.

### 6. Evaluación continua

Archivo nuevo:

- `src/lib/agent-training-dataset.ts`

Responsabilidad:

- recoger casos representativos del club
- servir como suite de regresión
- medir intención, rama, datos detectados y restricciones respetadas

## Flujo objetivo

1. El cliente envía un mensaje.
2. El orquestador recupera el contexto anterior.
3. El sistema consulta la base de conocimiento del club.
4. El motor decide:
   - respuesta por reglas, o
   - llamada al LLM, o
   - llamada a una herramienta.
5. La respuesta se valida contra reglas del club.
6. La UI recibe una respuesta estructurada con texto, estado, datos detectados y acciones.

## Ruta de migración recomendada

### Fase 1. Endurecer la demo actual

- ampliar cobertura del dataset
- mover restricciones reales a `club-knowledge.ts`
- evitar hardcodes en la UI

### Fase 2. Evaluación reproducible

- crear una utilidad que ejecute `buildAgentReply` contra cada ejemplo del dataset
- detectar regresiones antes de tocar heurísticas o prompts

### Fase 3. Integración LLM

- conectar `src/app/api/ai/agent/route.ts` con un proveedor real
- usar prompts con contexto estructurado
- pedir salidas controladas: intención, datos detectados, siguiente acción y borrador de respuesta

### Fase 4. Tool calling

- mover acciones sensibles a funciones explícitas
- registrar trazabilidad de qué herramienta se llamó y con qué parámetros

### Fase 5. Aprendizaje operativo

- guardar conversaciones reales anonimizadas
- clasificar errores del bot
- convertir esos errores en nuevos casos del dataset

## Qué no conviene hacer todavía

- fine-tuning sin dataset suficiente
- meter toda la lógica del club dentro del prompt
- permitir que el LLM confirme reservas o cobros sin validación
- medir calidad solo leyendo conversaciones a mano

## Resultado esperado

Con esta arquitectura, el bot será más listo no por improvisar más, sino por combinar mejor:

- lenguaje natural
- reglas del negocio
- herramientas seguras
- evaluación continua