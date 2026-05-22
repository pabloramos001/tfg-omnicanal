# Integracion con Make

Esta demo ya expone un endpoint HTTP valido para Make en `POST /api/ai/agent`.

## Flujo recomendado

1. Make recibe un mensaje desde un webhook, formulario, Respond.io o WhatsApp.
2. Make busca el contexto previo de esa conversacion en un Data Store o en tu CRM.
3. Make hace `POST` a `https://tu-dominio/api/ai/agent` con `message` y `context`.
4. Make guarda `nextContext` para el siguiente turno.
5. Make reenvia `reply` al canal de origen.
6. Make usa `automation` para decidir si espera al cliente, cierra la gestion o la escala.

## Request

```json
{
  "message": "quiero reservar una pista hoy por la tarde",
  "context": {
    "intent": "reserva",
    "branch": "disponibilidad",
    "language": "es",
    "status": "esperando-cliente",
    "detectedData": {
      "actividad": "Pista",
      "fecha": "hoy"
    }
  }
}
```

Puedes omitir `context` en el primer mensaje.

## Response util para Make

```json
{
  "source": "ai-agent-mock",
  "input": "quiero reservar una pista hoy por la tarde",
  "nextContext": {
    "intent": "reserva",
    "branch": "disponibilidad",
    "language": "es",
    "status": "esperando-cliente",
    "detectedData": {
      "actividad": "Pista",
      "fecha": "hoy"
    }
  },
  "automation": {
    "waitingForCustomer": true,
    "shouldEscalate": false,
    "isResolved": false
  },
  "reply": "Puedo ayudarte con la reserva...",
  "missingFields": ["hora"],
  "detectedData": {
    "actividad": "Pista",
    "fecha": "hoy"
  },
  "actionButtons": []
}
```

## Escenario minimo en Make

Modulos:

1. Trigger de entrada.
2. Data Store o CRM para recuperar contexto por `conversationId`, `phone` o `chatId`.
3. HTTP `Make a request` al endpoint del agente.
4. Data Store o CRM para guardar `nextContext`.
5. Router con tres ramas usando `automation`.
6. Modulo de salida para responder al usuario.

## Configuracion del modulo HTTP en Make

- Method: `POST`
- URL: `https://tu-dominio/api/ai/agent`
- Header `Content-Type: application/json`
- Body type: `Raw`
- Content type: `application/json`

Body sugerido:

```json
{
  "message": "{{1.message}}",
  "context": {{2.contextJson}}
}
```

Si no tienes contexto previo, envia solo:

```json
{
  "message": "{{1.message}}"
}
```

## Que guardar en Make

Guarda `nextContext` entero como JSON. Esa es la forma mas limpia de mantener la conversacion sin reconstruir campos a mano.

Clave recomendada para almacenamiento:

- `conversationId`
- `phone`
- `chatId`
- o cualquier identificador estable del canal

## Ramas utiles en Make

Si `automation.waitingForCustomer` es `true`:

- reenvia `reply`
- conserva `nextContext`
- espera al siguiente mensaje

Si `automation.shouldEscalate` es `true`:

- crea tarea
- notifica al equipo
- adjunta `detectedData`, `missingFields` y el ultimo mensaje

Si `automation.isResolved` es `true`:

- reenvia `reply`
- marca la conversacion como cerrada

## Buenas practicas

- No confies en `reply` como unica salida para negocio; usa tambien `intent`, `branch`, `detectedData` y `missingFields`.
- Guarda el `context` por conversacion para no perder continuidad entre mensajes.
- Publica la app en una URL accesible desde Make; `localhost` no sirve para un escenario remoto.
- Si conectas WhatsApp o Respond.io, deja que Make orqueste el canal y usa este endpoint como motor conversacional.