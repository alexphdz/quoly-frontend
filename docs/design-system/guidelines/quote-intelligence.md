# Quote Intelligence & human review — Fase 05C.2 (R1)
Componentes para la extracción asistida por IA, la inspección de evidencia y la revisión humana. Tokens: `tokens/intelligence.css` (alias). Componentes: `components/intelligence/`. Tarjetas: grupo «05C.2 — Inteligencia y revisión de cotizaciones» (01–06).

## Reglas de producto
- Lo propuesto por IA nunca equivale a confirmado. Guardar una corrección no confirma.
- Sin porcentajes de confianza ni puntuaciones. Ninguna confirmación, respuesta o selección automática.
- La evidencia es siempre texto real de la fuente.

## Estados de un campo
Propuesto por IA (símbolo Quoly, color IA) · Confirmado (Check, éxito) · Corregido (lápiz, texto principal, + “Valor extraído: …”, coexistiendo con Confirmado o Sin confirmar) · No indicado (“—”) · No comparable (+ motivo). Siempre icono + texto.

## Color
IA = procedencia o revisión, no corrección. Éxito = confirmado por el comprador. Advertencia = atención, no inválido. Coral de marca no indica corrección. Colorfield no se usa aquí.

## Componentes
- **ExtractionSummary:** padding 20/0, gap 12, texto máx. 620. Identificador 11/600 +0.06em IA; estado 12/500; resumen 14/1.6 (énfasis 600); metadatos 12. Fade 180 ms solo con resultado nuevo.
- **ExtractedField:** 36/64, mín. 56, padding 12/0; etiqueta 13/500, valor 14/600 tabular, unidad 12, indicador 12/500. Selección: superficie neutra 160 ms.
- **EvidenceReference / EvidencePanel:** compacta mín. 28, icono 16, gap 8, 12/500, sin pastilla; ampliada padding 20, superficie contextual, borde, radio 8; extracto 14/1.6 con saltos originales; pasaje con fondo IA sutil + subrayado, 180 ms.
- **FieldReviewEditor:** edición en la fila con TextInput sm + unidad, Cancelar / Guardar cambio, Confirmar valor aparte; ValidationMessage de 05A; 160 ms opacidad + 4 px; Enter / Escape; foco devuelto.
- **ExtractionCompleteness:** Outfit 18 + Outfit 24; pista 6 px, segmentos por campo (gap 2, radio 2) hasta 24; confirmado / pendiente / no comparable / no indicado; 240 ms.
- **ReviewWorkspace:** ≥920 58/42 gap 24 con fuente fija; 600–919 apilado; <600 secuencial (campo n de N, pasaje). Resumen y completitud derivados del estado de los campos.

## Accesibilidad (WCAG 2.2 AA)
Referencias con aria-pressed / aria-controls; anuncio aria-live del pasaje; campos como grupos etiquetados; input “Corregir {campo}” con error enlazado; ningún estado solo por color; todas las duraciones a 0 con reduced motion.

## Relación con objetos anteriores
`objects/ExtractedFact` y `objects/SourceLink` (heredados) siguen sin cambios; estos componentes son la referencia para la revisión de cotizaciones.

## Refinamiento visual R1
Tres niveles de énfasis: **1** valores comerciales, totales y acción primaria (Outfit 24–40) · **2** etiquetas, estado, procedencia y evidencia (Inter 12–13) · **3** horas, valor original y fuente técnica (Inter 11).
- **Quoly Intelligence Graph** (`IntelligenceMark`): nodos A(5,12) B(11,5) C(19,9) D(15,19), aristas AB BC CD DA BD, trazo 1.6, nodos r≈2, color IA, sin contenedor. Estático; en procesamiento las aristas pulsan 0.45→1 en secuencia (1800 ms).
- **Fila de revisión:** 25/47/28, padding 20, gap 16, mín. 104. Valor numérico Outfit 24/500/29 + moneda 12/500 + unidad 12/400; texto largo Inter 15/500/22. Procedencia 9 px debajo (11/500). Región C: estado y, a 16, Confirmar (Button secondary sm) + Editar (TextButton). Hover: superficie neutra 140 ms. Seleccionado: superficie elevada, radio 8, línea de marca 22×2 bajo la etiqueta (200 ms).
- **Edición:** la fila se expande en superficie elevada (radio 8, padding 20); 12 / 10 / 20 entre etiqueta, input, contexto y acciones.
- **Resumen:** 68/32; afirmación Outfit 20; “6 / 7” Outfit 40/400; barra 4 px; “n por revisar” IA; “Revisar campos”.
- **Evidencia:** referencia mín. 32, icono 15, subrayado que se dibuja en 180 ms; documento con encabezado 20, cuerpo 14/1.7, pasaje con subrayado 1 px IA; pie “Fragmento asociado · {campo}”.
- **Workspace:** 60/40, gap 32, ≥1040 px; 24 / 16 / 28 / 32 entre título, resumen, completitud y filas.
- **Completitud:** Outfit 17 + explicación; Outfit 26; barra 6 px gap 3 sobre superficie elevada.
