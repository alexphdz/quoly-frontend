# Commercial quote comparison — Fase 05C.3
Tokens: `tokens/comparison.css` (alias sobre tokens aprobados). Componentes: `components/comparison/`. Tarjetas: grupo «05C.3 — Comparación de cotizaciones» (01–07).

## Integridad
Comparar no es ordenar ni adjudicar. Sin “mejor oferta”, puntuación, ahorro, tipo de cambio ni costo total. El precio normalizado se muestra encima del original, nunca en su lugar. Ausente (“—” No indicado), no comparable (+ motivo) y sin revisar (IA) son condiciones distintas. Con una sola cotización comparable no hay diferencia. Las cifras de demostración son ficticias y fijadas de antemano.

## Componentes
- **ComparisonOverview:** 65/35, mín. 100, padding 20/0. Outfit 26/32 + Inter 12/500; conteo Outfit 36/500 + “Cotizaciones recibidas”; “n comparables · n requiere revisión”.
- **SupplierComparisonHeader:** mín. 224 (248), mín. 108, padding 20/18. Outfit 17/500/22 (2 líneas), referencia 11, estado 12, moneda 11. Hover 140 ms; seleccionado: línea coral 28×2, 200 ms.
- **ComparisonMatrix:** rail 216 fijo + columnas minmax(248,1fr); grupos 42 Outfit 15; filas mín. 72 padding 14/16; fila de precio mín. 104 sobre superficie hundida, normalizado Outfit 26, original debajo. MOQ 15/600, lead 15/500, Incoterm 14/500, condiciones 13/20. Excepción → ContextPanel; Ver fuente → EvidencePanel con pasaje; celda activa elevada 160 ms. Desplazamiento: región enfocable, aviso y botones, scroll-padding; maxHeight → encabezados fijos. <640 px: dos proveedores con selectores.
- **PriceDifference:** Outfit 20 diferencia respecto al menor comparable (“Base” para el menor), calificador 11 con %, barra 4 px máx. 120 escalada como precio ÷ mayor comparable, 240 ms.
- **CommercialException:** icono 15 + Inter 12/500/17, gap 6. Advertencia · información · IA · neutro. Detalle en ContextPanel 320.
- **ComparisonEvidenceLink:** EvidenceReference de 05C.2 con “Ver fuente” 11/500; sin evidencia: “Sin fuente asociada”.
- **ComparisonFocus:** tablist con subrayado coral 200 ms, panel con opacidad 160 ms, columnas estables.

## Color
Coral: foco y selección. Violeta IA: procedencia o revisión pendiente. Éxito: revisión confirmada. Advertencia: atención. Información: diferencias y barra analítica. Sin colores por proveedor; verde nunca marca el menor precio.

## Accesibilidad (WCAG 2.2 AA)
Roles de tabla en la matriz; excepciones aria-expanded; evidencias aria-pressed/aria-controls; tabs con flechas; región desplazable con nombre; estados con icono y texto; duraciones a 0 con reduced motion.
