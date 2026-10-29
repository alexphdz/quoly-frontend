# Decision & award — Fase 05C.4
Tokens: `tokens/decision.css` (alias). Componentes: `components/decision/`. Tarjetas: grupo «05C.4 — Decisión y adjudicación» (01–08).

## Reglas
El comprador decide. Quoly muestra hechos y cotizaciones revisadas; no recomienda, no puntúa, no calcula ahorros, no notifica ni emite órdenes. Comparable ≠ seleccionado ≠ adjudicación registrada. El precio menor nunca se adjudica automáticamente. Antes de confirmar no se muestra ningún registro. El historial solo contiene eventos persistidos.

## Componentes
- **SelectionIndicator:** mín. 28, gap 7, Inter 12/600. Seleccionado (CheckCircle marca) · Pendiente de confirmar (Clock marca) · Adjudicación registrada (éxito).
- **DecisionCandidate:** 42/38/20, mín. 148, padding 24, gap 24. Nombre Outfit 21, precio Outfit 27, hechos 2 col. “Seleccionar proveedor” (secondary) frente a “Ver cotización” (texto). Seleccionado: línea 28×2 de marca, 200 ms.
- **DecisionSummary:** 60/40, gap 32, mín. 180. Outfit 30 proveedor, Outfit 38/400 precio de referencia; KeyValueGroup opcional.
- **DecisionRationale:** Outfit 18 + Inter 13/20; contexto KeyValueGroup aparte; Textarea 05A mín. 120, máx. 720; ValidationMessage si es obligatorio.
- **AwardConfirmation:** 520, padding 28, radio 12, elevación 3. Eyebrow 11/600, Outfit 24, Inter 14/21; recapitulación Outfit 20 + Outfit 25; Cancelar + Registrar adjudicación. Pendiente bloquea duplicados y cierre; fallo conserva el diálogo. 180 ms / 140 ms.
- **AwardRecord:** eyebrow éxito, Outfit 24, metadatos 12; KeyValueGroup 2 col; “Motivo registrado” 12/600 + 14/22.
- **DecisionTimeline:** 120 · 24 · flexible; evento mín. 72, gap 20; conector 1 px neutro, nodo 6 px (último en marca). Vacío → EmptySection.

## Accesibilidad (WCAG 2.2 AA)
Acciones nativas con nombres claros; estados con icono y texto; diálogo con foco atrapado y devuelto, aria-busy y role="alert" en fallos; lista ordenada en el historial; duraciones a 0 con reduced motion.

## Corrección visual · Award Highlight
- Proveedor **seleccionado** sin registro: superficie neutra, CheckCircle de marca, “Seleccionado para adjudicación”. Nunca el trofeo.
- **Adjudicación registrada:** superficie tintada (brand-100 al 55% / brand-950 al 50% sobre la superficie, tokens de componente `--dec-award-*`), radio 12, padding 28/20, borde sutil, sin sombra. Símbolo 44×44 radio 12 con Phosphor Trophy 22 duotone (#B72F3E sobre brand-100; #FF8997 sobre brand-950). Eyebrow 11/600 +0.08em, Outfit 30 proveedor, Outfit 32 precio, pie con “Registrado por … · fecha” y “Ver cotización”.
- Transición seleccionado → registrado: superficie 260 ms (0.22,1,0.36,1), iconos 160 ms; sin escala ni celebración.
- Marcador compacto en la comparación: Trophy 15 + “Adjudicado” 12/600, sin fondo; se coloca con la prop `marker` de SupplierComparisonHeader.


## Corrección · Decision Row y Award Record formal
- **DecisionRow** (card 09): default · hover · candidato a adjudicación (fila tintada, barra coral 4 px, nombre 16/600, Trophy en línea, “Confirmar adjudicación”) · adjudicado (fila más intensa, barra a altura completa, “Adjudicado” + candado de registro). Seleccionar nunca registra la adjudicación.
- **AwardRecord** (card 06): bloque editorial sin tarjeta ni contenedor de icono. Regla superior coral 3 px, eyebrow con Trophy en línea, proveedor Outfit 36 a la izquierda, snapshot comercial (precio Outfit 34) a la derecha, pie con registro y “Ver cotización”.
- El trofeo siempre va en línea, nunca dentro de un cuadrado tintado.
