# Quoly

**El espacio de trabajo entre pedir cotizaciones y decidir.**

Quoly ayuda a un comprador a cotizar con los proveedores que ya conoce, y a convertir respuestas desordenadas en una comparación que puede defender.

Esta es la interfaz web de Quoly: el lado del comprador. Los proveedores nunca entran aquí; responden por correo, como siempre.

- Producción: `https://quoly.app`
- Staging: `https://staging.quoly.app`

---

## El problema

Las cotizaciones casi nunca llegan listas para comparar. Llegan como correos, PDFs, hojas de Excel, documentos de Word, fichas técnicas y hasta fotos de listas de precios. Unas traen precio pero no tiempo de entrega; otras traen una pregunta en vez de una oferta; cada proveedor usa su propio formato y su propia moneda.

Juntar todo eso a mano, en una hoja de cálculo, es lento y frágil. Quoly lo ordena por ti.

## Cómo funciona

```
Creas la solicitud  →  Eliges proveedores y la envías  →  Los proveedores responden por correo
→  Quoly lee las respuestas  →  Tú revisas  →  Se acumulan las cotizaciones
→  Comparas  →  Decides (adjudicas)
```

Una misma solicitud puede tener varios proveedores en etapas distintas al mismo tiempo: uno ya cotizó, otro sigue en silencio, otro está esperando que le respondas algo.

## Qué puedes hacer

- **Crear una solicitud** comercial corta: qué compras, cuánto, en qué unidad, y lo que quieras agregar (Incoterm y lugar, fecha deseada, requisitos técnicos, un archivo de referencia).
- **Elegir proveedores** de tu directorio privado o solo para esa solicitud, y enviarles la solicitud desde tu propio correo.
- **Leer lo que llegó:** Quoly extrae de cada respuesta la cotización (precio, escalones, MOQ, tiempos de entrega, validez, pago), la evidencia técnica y las preguntas del proveedor, siempre con las palabras originales a la vista. Tú revisas y corriges lo que haga falta.
- **Responder las preguntas** del proveedor: Quoly te propone un borrador que puedes usar, editar o reescribir. Nada se envía solo.
- **Comparar** a los proveedores lado a lado, con un recomendado y lo que todavía falta visible, y **adjudicar** cuando tú decides. Puedes exportar la decisión a PDF.

## Lo que hace la inteligencia artificial (y lo que no)

La IA reduce el trabajo manual: lee respuestas desordenadas, propone la estructura comercial, saca la evidencia técnica, resume cada oferta y redacta el análisis de la comparación.

Lo que **no** hace: no responde ni adjudica por su cuenta, no inventa datos que el proveedor no dio, no rellena huecos para que una cotización incompleta parezca completa, y no pone un puntaje mágico. La IA propone; tú decides.

## Pensado para

Compradores, compras, sourcing y pequeñas empresas cuyo proceso todavía corre por correos, archivos y hojas de cálculo. Disponible en **Español e Inglés**, con modo **claro y oscuro**.

Los proveedores no necesitan cuenta ni aprender un portal. Quoly organiza el lado del comprador; ellos siguen respondiendo por correo.

---

## Desarrollo

Aplicación web hecha con React, TypeScript y Vite. Consume la API del backend (FastAPI); aquí vive solo la interfaz.

```bash
npm install
cp .env.example .env     # ajusta VITE_API_BASE_URL (la URL de la API)
npm run dev              # http://localhost:5173
```

Scripts útiles: `npm run build` (build de producción), `npm run lint`, `npm run test:e2e` (Playwright). El despliegue es en Vercel (`qa` → staging, `main` → producción).

Para más detalle hay documentación aparte:

- `docs/GUIA_USUARIO.md` — guía de usuario, pantalla por pantalla.
- `docs/QUOLY_DESIGN_SYSTEM.md` — el sistema visual (color, tipografía, componentes).
