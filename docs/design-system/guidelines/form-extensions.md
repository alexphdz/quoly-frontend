# 07 — Form Experience Extensions

Componentes en `components/forms/`. Canonizan los patrones aprobados en *Quoly Application Screens → 03 — Crear / editar solicitud*. **Paridad visual con la implementación de origen no verificada**: el proyecto de origen no fue accesible; se implementó a partir de la especificación de integración como contrato.

Reutiliza Icon, Button, IconButton, TextButton, TextInput, ValidationMessage y Progress (05A). Sin tokens nuevos. La Quoly Intelligence Graph no aparece en estos componentes.

## 07.1 FormSectionNavigator
Propósito: navegación de anclas en formularios largos de una página. No es un asistente.
Anatomía: icono 18 · número Inter 11/600 · título Inter 13/600 · apoyo Inter 11 · conector 1 px. Máx. 780, alto ≈ 68, gap 18, sin tarjeta.
Activo: texto principal, icono brand, subrayado 24 × 2 radio 1 (200 ms cubic-bezier(0.22, 1, 0.36, 1); salida 140 ms). Hover: texto principal 160 ms.
Comportamiento: onNavigate(id) o salto a #target · conserva valores · no valida ni envía · useActiveSection(ids) opcional.
Responsive: horizontal; en mobile se desplaza y mantiene visible el activo.
A11y: nav + ol + enlaces, aria-current="step", foco 05A.
API: sections[{id,title,description,icon,number,target}], active, onNavigate, numbered, label.

## 07.2 IncotermExplorer
Propósito: agregar un Incoterm 2020 opcional.
Estados: contraído · cuadrícula · resumen seleccionado · resumen + campo de lugar.
Medidas: disparador mín. 76, padding 16/20, radio 8 · cuadrícula 4/3/2 col, gap 8, padding 16, --surface-context · opción mín. 80, padding 12, radio 6, icono 18, código 14/600, descripción 11/15 · resumen mín. 64, padding 16.
Seleccionado: borde brand, --color-surface-selected, icono brand, check 16.
Iconos: EXW factory · FCA truck · CPT path · CIP shield-check · DAP map-pin · DPU warehouse · DDP stamp · FAS anchor-simple · FOB boat · CFR coins · CIF umbrella (asignación provisional: la del origen no fue accesible).
Lugar: EXW/FCA Lugar de entrega · CPT/CIP/DAP/DPU/DDP Lugar de destino · FAS/FOB Puerto de embarque · CFR/CIF Puerto de destino. Placeholders de ejemplo, nunca valores. El texto escrito se conserva al cambiar de término.
Movimiento: expandir 220 ms · caret 180 · hover 140 · selección 160.
A11y: aria-expanded/controls · radiogroup con tabindex móvil · flechas, Inicio/Fin, Enter/Espacio, Escape.
API: value/defaultValue, onChange(code|null), onRemove, place/defaultPlace, onPlaceChange, expanded/defaultExpanded, onExpandedChange, options, placeLabels, placeHints.
Restricciones: opcional, una sola selección, sin cálculos de flete o seguro.

## 07.3 DocumentDropzone
Propósito: adjuntar un documento de especificaciones opcional. No analiza contenido.
Medidas: máx. 780, mín. 104, padding 20, radio 8, borde 1 px discontinuo · FileArrowUp 24 · título 14/600 · descripción 12 · Button secundario sm.
Estados: reposo · hover (surface-hover, 160 ms) · arrastre (borde brand, surface-selected) · adjunto (icono por tipo, nombre, tamaño, quitar) · cargando (Progress lineal solo con progreso real; si no, indeterminado) · inválido (ValidationMessage con motivo real) · deshabilitado.
A11y: input file nativo etiquetado · aria-live · aria-describedby para el error.
API: accept, multiple, onSelect, onRemove, file{name,size}, upload{progress}, error, disabled.
Restricciones: tipos y límites vienen de la app; no extrae requisitos, no compara, no envía.

## Composición en Crear / editar solicitud
Navegador arriba → secciones Producto · Entrega (IncotermExplorer) · Requisitos (DocumentDropzone), todas visibles, columna máx. 780, 28 entre bloques. Ver card 07.4.
