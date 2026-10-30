# RFQ & supplier workflow components — Fase 05C.1
Primeros componentes específicos de producto. Tokens: `tokens/rfq.css` (alias sobre tokens aprobados). Componentes: `components/rfq/`. Tarjetas: grupo «05C.1 — Solicitudes y proveedores» (A–F).

Etapas del flujo: Borrador · Enviada · Cotizaciones · Cerrada. No hay etapas, puntuaciones, aprobaciones ni decisiones automáticas adicionales.

## A · RfqHeader
Sin contenedor, padding 20/0. Título Outfit 28/500/1.2; fila de metadatos a 8: referencia Inter 12/500 tabular, StatusBadge, “Creada el …” 12. Una acción de 05A a la derecha (gap 24) solo cuando el estado la permite. <768px: la acción baja (gap 12); el título nunca se trunca.

## B · RfqLifecycle
≈52 de alto, transparente, gap 20, conectores 1 neutros. Icono 16 + Inter 13. Actual: 600, icono de marca, línea 24×2 de marca. Completada: CheckCircle de éxito, 400 principal. Futura: secundario. La línea crece 0→24 en 200 ms (0.22,1,0.36,1) solo cuando `current` cambia; icono 160 ms. <560px: vertical. ol + aria-current="step" + estado anunciado.

## C · RfqSummary
5 columnas ≥880, 3 ≥560, 2 ≥340, 1 debajo; gap 24/20. Etiqueta 12/500, valor 15/600, detalle 12; 5 entre etiqueta y valor. Solo el plazo vencido usa color de error (con icono y texto). Participación explícita. Sin cotización líder: “Sin cotizaciones comparables”.

## D · ResponseTracker
Etiqueta 12/500 + conteo Outfit 24/500; a 12 un indicador de 5 px (segmentos gap 3, radio 2; continuo con más de 12 proveedores); grafito = respondido, borde = pendiente; a 10 el desglose. 280 ms solo ante cambios reales. role=progressbar con aria-valuetext.

## E · SupplierRow
Mín. 64, padding 12/16, divisor 1. Identidad ≥220 (14/600 + contacto 12) · participación 140 (12/500 semántico + icono) · actividad 140 · cotización 120 solo con cotización válida. Hover neutro 140 ms + trace de 05B.1; foco alrededor del nombre. <640px: dos líneas. Sin contacto: “Sin contacto registrado”.

## F · SupplierQuestion
Registro de comunicación en dos regiones (200 + flexible, gap 32), padding 16/0, divisores. Etiqueta de estado: “Requiere respuesta” en advertencia + icono, o “Respondida”. Pregunta 14/500/1.5, contexto 12, acción TextButton “Responder” a 12. La respuesta solo se muestra tras confirmación. <600px se apila.

## Accesibilidad (WCAG 2.2 AA)
Estado y progreso nunca solo por color (texto + icono). Nombres accesibles en progreso, etapas y acciones. Foco visible con el sistema de 05A. Todas las duraciones a 0 con prefers-reduced-motion.

## Relación con objetos anteriores
`objects/QuestionFlag` y `objects/SupplierLabel` (heredados) siguen sin cambios; los componentes de 05C.1 son los de referencia para flujos de solicitud.
