# Quoly 2.0 · Fundamentos espaciales
**Fase 03 — composición, geometría, espaciado, superficies y elevación.** Sustituye los fundamentos espaciales anteriores (§14). Color (Fase 01) y tipografía (Fase 02) sin cambios.

Valores: `tokens/spacing.css` (movimiento separado en `tokens/motion.css`, fuera de alcance, sin cambios). Guía visual: grupos **Spacing, Layout, Geometry, Surfaces**.

## 1. Filosofía de composición
Quoly se organiza alrededor de la información, no de los contenedores. Cada decisión espacial responde a la auditoría:
| Problema | Corrección |
|---|---|
| 3.1 Contenedores sobredimensionados | Tamaño por contenido (§3E): sin alturas fijas; anchos entre mínimo y máximo por rol (§4). |
| 3.2 Estructuras equivalentes | Escalera de separación (§9): espacio → divisor → tono → borde → elevación. La tarjeta no es el recurso por defecto. |
| 3.3 Jerarquía espacial insuficiente | Escala por importancia + doble cadencia (grupo ≥ 2× interior). |
| 3.4 Densidad inconsistente | Tres niveles por región (§6), sin tocar la tipografía aprobada. |
| 3.5 Dark plano | En dark la elevación sube en claridad (#1B1C22 → #303038) y la define el borde; la sombra solo refuerza (§10). |
| 3.6 Composición convencional | Principios propios: ejes de datos, contraste de densidad, eje central de comparación heredado del logotipo. |

## 2. Escala de espaciado
| Token | px | Rol |
|---|---:|---|
| --space-0 | 0 | Regiones contiguas |
| --space-0-5 | 2 | Ajuste óptico |
| --space-1 | 4 | gap-micro: icono–texto, valor–moneda–unidad |
| --space-1-5 | 6 | gap-label: etiqueta sobre valor/control |
| --space-2 | 8 | gap-inline, gap-actions, inset vertical de fila |
| --space-3 | 12 | gap-stack, gap-label-inline, inset horizontal de fila |
| --space-4 | 16 | gap-field, gap-heading-section, gap-action-groups, inset de contexto |
| --space-5 | 20 | inset-region-y |
| --space-6 | 24 | gap-group, gap-heading-page, inset-region-x, gap-data-columns, gutter ≥768 |
| --space-8 | 32 | gutter ≥1536; group/region comfortable |
| --space-10 | 40 | gap-section default |
| --space-12 | 48 | gap-section comfortable |
| --space-16 / 20 / 24 | 64 / 80 / 96 | Solo editorial y marketing |

Regla: ningún valor fuera de la escala. Producto usa 0–48; 64–96 solo editorial.

## 3. Composición
A **Escala por importancia** — un protagonista por vista; tamaño según función.
B **Doble cadencia** — separación entre grupos ≥ 2 × separación interior (8 → 24, 16 → 40).
C **Contenedor con razón** — solo si delimita una unidad funcional, separa contextos, crea una región interactiva, diferencia una tarea o tiene comportamiento propio.
D **Ejes de datos** — etiquetas en columna fija; cifras comparables comparten eje derecho; títulos alineados con el contenido.
E **Tamaño por contenido** — regiones con hug; ningún alto fijo; espacio sobrante a márgenes, no a vacío interior.
F **Contraste de densidad** — editorial amplio y operativo compacto conviven por región (`data-density`); el ritmo varía entre zonas.
G **Eje central de comparación** — de la geometría del logotipo (dos lados con hueco central): una regla central estructura comparaciones entre opciones. Estructura, nunca decoración.

### Relaciones semánticas (default · comfortable · compact)
| Token | Default | Comfortable | Compact | Relación |
|---|---:|---:|---:|---|
| --gap-micro | 4 | 4 | 4 | Elementos fusionados |
| --gap-inline | 8 | 8 | 8 | Hermanos en línea |
| --gap-label | 6 | 6 | 6 | Etiqueta → valor apilado |
| --gap-label-inline | 12 | 12 | 12 | Etiqueta ↔ valor en línea |
| --gap-stack | 12 | 16 | 8 | Filas de un grupo |
| --gap-field | 16 | 20 | 12 | Campos de formulario |
| --gap-group | 24 | 32 | 20 | Grupos de una sección |
| --gap-section | 40 | 48 | 32 | Secciones |
| --gap-heading-page | 24 | 24 | 24 | Título de página → contenido |
| --gap-heading-section | 16 | 20 | 12 | Encabezado → contenido |
| --gap-heading-group | 8 | 8 | 8 | Título de grupo → contenido |
| --gap-actions / --gap-action-groups | 8 / 16 | 8 / 16 | 8 / 16 | Acciones relacionadas / grupos; destructiva separada ≥16 |
| --gap-data-columns | 24 | 32 | 16 | Columnas de datos comerciales |
| --inset-region-x / -y | 24 / 20 | 32 / 24 | 16 / 12 | Padding de región |
| --inset-context | 16 | 20 | 12 | Padding de región contextual |
| --inset-dialog | 24 | 32 | 20 | Padding de overlay |
| --inset-floating / -item-x | 4 / 12 | 4 / 12 | 4 / 12 | Menús flotantes |
| --row-height | 44 | 56 | 36 | Altura orientativa de fila |
| --row-inset-x / -y | 12 / 8 | 16 / 12 | 8 / 6 | Padding de fila |
| --gap-editorial-section / -block | 64–96 / 32–48 | | | Marketing |

## 4. Layout
- Grid conceptual: **4 col (<768) · 8 col (768–1023) · 12 col (≥1024)**. Gutter 16 / 24 / 32 (≥1536). Margen de página fluido `clamp(16px → 40px)`.
- El grid alinea regiones; el interior de cada región usa su propio flujo con `gap`.
- Anchos: lectura 720 · formulario 640 · contexto 360 (320–400) · principal mín. 560 · comparación: columna de etiquetas 220, columnas 200–320 · diálogos 400 / 560 / 720 · flotantes 200–360 · workspace máx. 1440 · comparación máx. 1680 · editorial máx. 1200.
- Composiciones: 1 región · principal + contexto 8:4 (defecto ≥1280) o 9:3 (≥1024) · dos regiones 6:6 solo para contenidos comparables (original ↔ estructurado) · tres regiones 4:4:4 solo si son del mismo nivel y cada una ≥320 · editorial 5:7 · comparación (etiquetas fijas + n columnas).
- Reducir/ampliar: una región se reduce hasta su mínimo; por debajo, se reorganiza (contexto pasa a panel superpuesto) antes que comprimir texto.

## 5. Contenedores
Separar primero con espacio. Añadir divisor si hay filas. Tono si es contexto o banda. Borde si dos superficies del mismo tono se tocan o es interactivo. Elevación solo si flota. Nunca tarjeta dentro de tarjeta; máximo dos niveles tonales anidados. Regiones contiguas comparten un único borde.

## 6. Densidad
| Nivel | Usar | Evitar |
|---|---|---|
| Comfortable | Lectura, revisión documental, evidencia, onboarding, ajustes | Tablas >10 filas |
| Default | La mayor parte del workspace | — |
| Compact | Tablas extensas, listas densas, comparación comercial | Formularios, lectura, táctil |
Se aplica por región: `data-density="comfortable|compact"` (default sin atributo). Compact también activa los roles de tabla compactos de la Fase 02; valores comerciales ≥13px.

## 7. Radios
| Token | px | Uso |
|---|---:|---|
| --radius-none | 0 | Regiones a sangre, celdas, esquinas compartidas |
| --radius-xs (indicator) | 3 | Checkbox, progreso, marcas |
| --radius-sm (tag, control-compact) | 5 | Etiquetas, chips, controles ≤32 |
| --radius-md (control) | 8 | Controles 36–48, items de menú, campos |
| --radius-lg (region, floating) | 12 | Regiones delimitadas, menús, popovers |
| --radius-xl (dialog) | 16 | Diálogos y overlays |
| --radius-2xl (editorial) | 20 | Solo marketing |
| --radius-full | 9999 | Avatares, interruptores, contadores circulares; nunca botones ni etiquetas |
Anidado: interior = exterior − separación (mín. xs). Elementos ≤24px de alto nunca superan sm.

## 8. Bordes
0 / 1 / 2px. Roles: `--border-divider` (filas), `--border-default` (límite de región), `--border-control` (≥3:1), `--border-structural` (reglas de comparación, totales), `--border-emphasis` 2px (cabecera de decisión), `--border-selected` 2px + selection-bg, estado 1px `status-*-border` siempre con texto, foco `--focus-ring` (2px + 2px de separación, box-shadow). Divisores verticales solo si la alineación no basta. Nunca 2px decorativo.

## 9. Superficies
| Nivel | Token | Light | Dark | Contiene |
|---|---|---|---|---|
| 1 Canvas | --surface-canvas | #F0F1F2 | #0D0E12 | 2, 3 |
| 2 Contenido | --surface-content | #FFFFFF + borde default | #1B1C22, solo tono | banda, pozo, 4 |
| 3 Contexto | --surface-context | #F6F6F7, sin borde | #15171D, sin borde | filas, texto |
| Banda tonal | --surface-band | #E5E7EA | #303038 | cabeceras de grupo dentro de 2 |
| 4 Elevada | --elevation-1/2-* | surface + borde + sombra | surface-elevated + borde | contenido propio |
| 5 Overlay | --elevation-3-* + scrim | surface + sombra 3 | surface-elevated + borde + sombra 3 | — |
Escalera de separación: espacio → divisor → tono → borde → elevación; usar el primer recurso suficiente.

## 10. Elevación
| Nivel | Light | Dark | Uso |
|---|---|---|---|
| 0 | none | none | Integrado en el plano |
| 1 | 0 1px 2px 0 rgba(21,23,29,.06) | 0 1px 2px 0 rgba(0,0,0,.32) | Cabecera fija sobre scroll, hoja de documento |
| 2 | 0 1px 3px 0 / .06 + 0 8px 24px −6px / .14 | inset 0 1px 0 rgba(246,246,247,.05) + 0 8px 24px −6px / .56 | Menús, popovers |
| 3 | 0 2px 6px 0 / .06 + 0 24px 56px −12px / .24 | inset 0 1px 0 / .06 + 0 24px 56px −12px / .72 | Diálogos, paneles superpuestos |
Sombra light con neutral-950; dark con negro. Sin sombras de color, desenfoque de fondo ni glassmorphism. Capas: `--layer-sticky` 10 · `-floating` 100 · `-overlay` 1000 · `-toast` 1100.

## 11. Dimensiones
- Controles: xs 32 · sm 36 · md 40 (defecto) · lg 44 (táctil) · xl 48 (prominente). Controles en una fila comparten altura.
- Iconos: 12 · 14 · 16 (defecto con body-md/label-md) · 20 (label-lg, controles ≥44) · 24 · 32 (estados vacíos).
- Objetivos: mínimo 24 × 24 y 8px entre objetivos (WCAG 2.5.8); 40 recomendado; 44 con `pointer: coarse`.
- Proporciones: documento 1 / 1.414, media 16 / 9, cuadrado 1 / 1.
- Overflow: texto ajusta en líneas; tablas desbordan con scroll horizontal y primera columna fija; nunca se comprime texto para caber.

## 12. Responsive
| Rango | Cambio de composición |
|---|---|
| <480 | 1 columna; acciones al pie a ancho completo; comparación con scroll y etiquetas fijas |
| 480–767 | Campos cortos en pares; diálogos casi a pantalla completa |
| 768–1023 | 8 col; contexto como panel superpuesto; formularios a 2 columnas |
| 1024–1279 | 12 col; contexto lateral 9:3 si principal ≥560 |
| 1280–1535 | 8:4 por defecto; 4 proveedores sin scroll |
| ≥1536 | Ancho máximo alcanzado; comparación hasta 1680; resto margen |
Prioridad: tarea → acción principal → estados → datos comparables → contexto (se pliega, no desaparece) → metadatos. Las tablas comparativas nunca se convierten automáticamente en tarjetas.

## 13. Accesibilidad espacial
Objetivos ≥24px y separación ≥8px · reflow a 320px CSS sin scroll horizontal salvo tablas · zoom 200 % y espaciado de texto ampliado (1.4.12) sin solapamientos: ninguna altura fija en contenedores con texto · etiquetas adyacentes a su control (gap-label 6) · jerarquía por escala, espacio y posición, no solo color · foco 2px + 2px siempre visible y sin recorte (`overflow` nunca oculta el anillo) · contenido largo y español (+20–30 %) dimensionan los anchos.

## 14. Combinaciones y conflictos
- Radio sigue a la altura: control 32 → sm, 36–48 → md; región → lg; overlay → xl.
- Densidad compact nunca se combina con controles lg/xl ni con lectura.
- Elevación 2–3 siempre con radio lg/xl y borde en dark.
- **Conflicto documentado (sin cambios en Fase 01):** la Fase 01 describe `--color-surface-elevated` como superficie para “menús y popovers”. En light ese tono (#E5E7EA) es más oscuro que surface y, al flotar, se lee como hundido. Esta fase asigna a los flotantes light `--elevation-2-bg = --color-surface` y reserva surface-elevated para bandas tonales. En dark se mantiene surface-elevated. Pendiente de tu validación.

## 15. Obsoleto
Escala anterior (--space-1…10 = 4…128; --space-5/6/8/10 cambian de valor), --section-y 152/120/180, --container 1240, --gutter 32, radios badge/control/button/surface/doc/modal (6/8/8/10/8/12), sombras popover/modal/doc, tarjetas spacing-scale, spacing-radii, spacing-elevation, layout-dark-section, layout-data-moment, layout-editorial-split. Se mantienen alias obsoletos en `tokens/spacing.css` para no romper componentes; los componentes usan tamaños literales que se migrarán en su fase.
