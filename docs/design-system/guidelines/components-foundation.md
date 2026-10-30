# Quoly 2.0 · Componentes fundamentales (Fase 05A)
Construidos solo con los fundamentos aprobados: color (Fase 01), tipografía (02), espacio/geometría (03), iconografía (04). Código: `components/{actions,inputs,selection,indicators,feedback,auxiliary}` + `components/core/{Icon,interact}`. Catálogo: grupo **Components** (light y dark en paralelo, estados forzados con la prop de documentación `state`).

Requisito de página: `styles.css` + `assets/icons/quoly-icons.js` + `_ds_bundle.js`.

## 0. Lenguaje visual común
- **Por función, no por uniformidad:** acciones = superficie/relleno; campos = pozo hundido (surface-sunken) + borde de control; selección = marca ink; indicadores = texto + icono, fondo solo cuando aporta; flotantes = elevación 2–3.
- **Coral solo en:** acción principal, foco, indicador de selección (chips), subrayado de enlaces/TextButton, punto de notificación. Nunca en checkbox, switch, tabs ni estados.
- **Marcados en ink** (text-primary): checkbox, radio, switch, tab seleccionada. Contraste máximo sin competir con la marca.
- **Foco ≠ hover:** hover cambia fondo o borde; foco añade `--focus-ring` (2px coral + 2px separación). Menús: anillo interior.
- **Disabled legible:** disabled-bg + disabled-fg + disabled-border; la forma del control se mantiene; cursor not-allowed; nunca solo opacidad.
- **Errores:** borde status-error-text (≥3:1) + mensaje con icono x-circle + texto, asociado con aria-describedby; aria-invalid.
- **Tamaños de control** (Fase 03): xs 32 · sm 36 · md 40 · lg 44 · xl 48. Radio 5 en xs, 8 en el resto. Densidad: compact → xs/sm, default → md, comfortable → lg. La tipografía no cambia con la densidad.
- **Tipografía:** Inter en todos los controles; Outfit solo en títulos de Popover (title-sm) y EmptyState (title-lg/sm). Ningún texto esencial por debajo de 12px; mensajes, ayudas y tooltips en body-sm 13.
- **Estados por componente:** ver tabla §7.

## 1. Acciones
### Jerarquía
| Nivel | Componente | Regla |
|---|---|---|
| Principal | Button primary | Una por zona de decisión. Coral + texto oscuro. |
| Secundaria | Button secondary | Alternativas de la principal; varias permitidas. |
| Contextual | Button tertiary / IconButton | Acciones repetidas en filas, barras, cabeceras. |
| Bajo énfasis | TextButton | En línea o al pie de bloques (“Pedir aclaración”). |
| Destructiva | destructive (inicia) → destructive-strong (confirma) | Rojo de error, nunca coral; separada ≥16px; confirmación explícita. |
| Deshabilitada | disabled | Explicar el motivo cerca (texto o tooltip). Preferir ocultar si nunca estará disponible. |

### Button
Propósito: ejecutar una acción. Anatomía: [icono] etiqueta [icono final]. Variantes: primary, secondary, tertiary, destructive, destructive-strong; toggle con `selected`. Tamaños xs–xl (32–48). Padding 10/12/16/20/24 (−2 en el lado del icono). Icono 16 (xs–md) / 20 (lg–xl), gap 6/8. Tipografía label-md (xs, sm) / label-lg. Superficie: primary sin borde; secondary surface + border-strong; tertiary sin fondo. Radio 5/8. Estados: default, hover, focus-visible, active, selected (toggle), disabled, loading (spinner sustituye al icono; aria-busy; ancho estable). A11y: `<button>`, aria-pressed en toggles, objetivo ≥ altura del control. Contenido largo: ajusta en varias líneas, nunca trunca. Responsive: `fullWidth` en <480 para la acción principal al pie. ✓ “Enviar solicitud”. ✕ dos primarias juntas; coral para eliminar.
### IconButton
Acciones reconocibles sin texto (cerrar, más opciones, copiar). 32/36/40/44 cuadrado; icono 16/20; Fill si seleccionado. `label` obligatorio → aria-label + title. ✕ como acción principal de un flujo.
### TextButton
Sin relleno ni padding; label-md/lg; subrayado coral en hover (2px en active). Objetivo ≥24px. Tono destructive. Actúa (button); los enlaces navegan y siempre van subrayados.
### SplitButton
Justificación funcional: variantes de una misma acción — Exportar decisión → PDF / Excel. Acción + disparador de menú (aria-haspopup, aria-expanded) contiguos con 1px de separación. Solo primary/secondary.
### ButtonGroup
Espaciado (gap 8, principal al final) o unido (segmentos secondary con borde compartido, aria-pressed). Unido solo para elegir vista/opción, no para acciones dispares.

## 2. Campos de entrada
Común (Field): etiqueta arriba label-md 13/500 · gap 6 · descripción body-sm · control · mensaje de validación. Requerido = “*”; opcional = “(opcional)”. Control: surface-sunken + 1px border-strong; hover border-hover; foco borde ink + anillo; error borde error + mensaje; success borde success + mensaje; read-only sin fondo, borde divisor, candado, texto seleccionable; disabled disabled-*. Altura xs–lg; padding 10/12/12/14; valor body-md. Placeholder text-muted y nunca sustituye a la etiqueta. Contenido largo: el valor hace scroll horizontal dentro del campo; la etiqueta ajusta en líneas.
| Componente | Específico |
|---|---|
| TextInput | Icono inicial opcional, sufijo, candado en read-only. |
| Textarea | Padding 10 × 12, line-height 1.5, crece en vertical; contador “n / máx.” con aria-live. |
| NumberInput | Cifras tabulares a la derecha, unidad visible (data-sm), inputMode decimal, sin spinners nativos. |
| SearchInput | type=search; lupa inicial; botón “Borrar búsqueda” (x, 24px) con valor; atajo Kbd sin valor. |
| Select | `<select>` nativo estilizado; caret-down; placeholder como opción deshabilitada. |
| MultiSelect | Disparador con hasta `maxVisible` valores + “+N”; listbox aria-multiselectable con casillas; elevation 2. |
| DateInput | Formato local como placeholder (dd/mm/aaaa · mm/dd/yyyy); botón “Abrir calendario”. Validación con mensaje (“anterior a hoy”). |
| CurrencyInput | Importe data-md-strong tabular a la derecha · unidad (“/ ud.”) · divisor · código ISO 4217 (select si `currencies`). `decimals` conserva la precisión del proveedor (2 por defecto, 4 en precios unitarios bajos). Formato con Intl según `locale` al salir. Moneda distinta = warning, no error. |

## 3. Selección
| Componente | Uso | Anatomía y medidas | Estados |
|---|---|---|---|
| Checkbox | Selección independiente (varios) | Caja 16 · radio 3 · marcado relleno ink + check bold 12 · input invisible 24 × 24 · etiqueta body-md + descripción | unchecked, checked, indeterminate, hover, focus, error (+mensaje), disabled |
| Radio | Elección exclusiva entre 2–5 opciones visibles | Círculo 16 · marcado borde ink + punto 8 · fieldset + legend | default, checked, hover, focus, disabled |
| Switch | Activación inmediata de un ajuste | Pista 36 × 20 radio full · off border-strong (≥3:1) · on ink · pulgar 16 · etiqueta a la izquierda · estado textual opcional | off, on, hover, focus, disabled, loading |
| SegmentedControl | Modo de vista (2–4) | Contenedor surface-elevated padding 2 radio 8 · segmento 32/28 radio 5 · seleccionado surface + elevation-1 + texto primario + icono fill | default, selected, hover, focus, disabled |
Regla: si el cambio requiere “Guardar”, checkbox; si actúa al momento, switch; si cambia la presentación, segmented.

## 4. Indicadores
| Componente | Regla |
|---|---|
| StatusBadge | Estado funcional. subtle (bg-subtle + texto), quiet (icono + texto, listas densas), strong (máx. uno por vista). 22px, radio 5, label-sm, icono 12 por tono (éxito check-circle, aviso warning, error x-circle, info info, IA quoly-proposed). Nunca sin texto. |
| Tag | Metadato no interactivo (Incoterm, moneda, unidad). Borde 1px border, texto secundario, radio 3, sin color. |
| Chip | Filtro o valor removible. 30px, radio 5, borde border-strong; seleccionado selection-bg + borde coral + check; quitar = botón x 24px con nombre. |
| Counter | 20px, radio 3, tabular; >max → “99+”; neutral, emphasis (inverso), ai. |
| NotificationIndicator | Punto coral 8px o contador inverso sobre icono/avatar, anillo 2px de superficie, etiqueta accesible obligatoria. |
| Progress | Barra 4px (pista border, relleno ink / success / AI) o pasos; siempre con etiqueta y valor textual; role=progressbar con aria-valuetext. |

## 5. Feedback e información
| Componente | Regla |
|---|---|
| Tooltip | Superficie inversa, body-sm, padding 6 × 10, radio 5, máx. 280. Aparece en hover y foco; nunca información esencial ni interactiva. |
| Popover | No modal; elevation 2, radio 12, padding 16; título title-sm (Outfit); acciones al pie. Esc cierra; foco vuelve al disparador. |
| InlineAlert | Pertenece a una región. bg-subtle + borde 1px del estado, radio 8, padding 12 × 16, icono 20, título label-lg primario, cuerpo body-md secundario, TextButtons. Sin barra lateral de color. |
| ValidationMessage | Icono 16 + body-sm en color de estado, bajo el campo, id enlazado con aria-describedby; error con role=alert. |
| Toast | Confirma una acción terminada o fallida. 360px, elevation 3, radio 8, icono de estado, título label-lg, acción “Deshacer” si aplica. role=status (error: alert). Mín. 6 s; pausa con hover/foco. |
| Spinner | circle-notch 16/20/24, role=status, etiqueta visible u oculta. reduced motion: estático. |
| Skeleton | Texto, bloque, control, círculo en surface-elevated; pulso 1,6 s; aria-hidden con aria-busy en el contenedor. |
| EmptyState | Icono 32 light (24 en sm), título Outfit title-lg/sm, explicación body-md ≤48ch, acciones. Sin ilustración. Centrado o alineado al inicio. |

## 6. Auxiliares
| Componente | Regla |
|---|---|
| Divider | horizontal/vertical; default (divider), strong (border), structural; con etiqueta caption. |
| Avatar | Iniciales neutras; persona = círculo, organización = cuadrado radio 5 (3 si <32). 20/24/32/40. role=img con nombre. |
| Kbd | 20px, label-sm, borde 1px + inferior 2px, surface-sunken. |
| BreadcrumbItem | label-md; secundario → primario + subrayado en hover; actual sin enlace con aria-current; separador caret-right 12; elipsis a 200px. Usar dentro de nav > ol. |
| MenuItem | 36px (compact 32), padding 0 12, radio 8 (anidado en flotante 12 − 4), icono 16 secundario, descripción body-sm, atajo, check si seleccionado; destructive en rojo; hover/teclado surface-hover; foco anillo interior. |
| Tabs | 40px (sm 36), label-lg/md, separación 24; seleccionada texto primario + subrayado 2px ink + icono fill + contador inverso; tabIndex roving; overflow con scroll horizontal. |

## 7. Estados pertinentes
| Componente | Default | Hover | Focus | Active | Selected | Disabled | Loading | Error | Success | Read-only |
|---|---|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | ✓ | toggle | ✓ | ✓ | — | — | — |
| IconButton | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — |
| TextButton | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — | — | — |
| Inputs | ✓ | ✓ | ✓ | — | — | ✓ | — | ✓ | ✓ | ✓ |
| Checkbox / Radio | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | ✓ (checkbox) | — | — |
| Switch | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — | — |
| Segmented / Tabs / Chip | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| MenuItem | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | — | — | — |
Indicadores y feedback no son interactivos (salvo acciones internas): sin hover/focus propios.

## 8. Accesibilidad
- Visual: contraste de todos los pares por tokens de Fase 01; bordes de control ≥3:1; foco visible y distinto del hover; estados por forma + texto además de color.
- Comportamiento: elementos nativos (button, input, select) siempre que sea posible; roles ARIA (switch, radiogroup, tablist, listbox, menu, tooltip, status/alert); Esc cierra flotantes; Tab/flechas según patrón WAI-ARIA; mensajes enlazados con aria-describedby; aria-busy en carga.
- Texto ampliado / zoom 200 %: alturas mínimas, nunca fijas; el texto ajusta en líneas.
- ES/EN: anchos dimensionados para español; etiquetas sin truncar; formatos con Intl.

## 9. Propuestas pendientes de aprobación
- **Prop `state`** (solo documentación) para forzar hover/focus/active en los catálogos.
- **Animaciones** `q-spin`, `q-pulse`, `q-indeterminate` añadidas a `tokens/base.css`, desactivadas con reduced motion.
- **Icono `minus`** (Phosphor) añadido al vocabulario para el checkbox indeterminado.
- Dialog (heredado) queda fuera de alcance; se rediseña en una fase posterior.

## 10. Sustituido
> 06C: `components/objects` (Quoly Objects) se retiró; sus funciones las cubren 05C.1–05C.4. Copia recuperable en `_archive/06C-legacy/`.

Eliminados: core/Button, core/Badge, core/Notice, core/Tabs, forms/Input, forms/Select, forms/Checkbox y sus tarjetas. Icon pasa de Lucide a Phosphor. Los objetos de dominio (`components/objects`) no se han tocado: siguen con alias obsoletos y se rehacen en 05B.

## 11. Revisión 05A-R1 (12 componentes)
Dirección: superficies mayoritariamente neutras, color solo en significado, componentes pequeños sin aspecto de tarjeta, foco coherente con el sistema.
| Componente | Anatomía nueva | Corrección |
|---|---|---|
| InlineAlert · notice | Fila integrada, sin contenedor; icono 16 regular en color de estado; texto 14 neutro; acción de texto en línea; padding 10 0; divisor opcional | Antes: caja pastel con borde. Ahora parte del contenido. |
| InlineAlert · contextual | Superficie neutra hundida, radio 8, padding 12 × 16; una sola señal: regla interior 2px en color de estado; título opcional label-lg; descripción body-sm | Sin fondo + borde + título coloreados. |
| InlineAlert · blocking | Superficie neutra + contorno 1px en color de estado (≥3:1); icono 16 fill; causa label-lg; detalle body-md; “Cómo resolverlo”; acción correctiva; padding 16; sangría 24 | Prominencia por estructura, no por relleno. |
| ValidationMessage | Sin contenedor; icono 14; body-sm 13/1.45; error en color de error, resto texto secundario con icono semántico | Solo el error colorea el texto. |
| Toast | Ancho por contenido 240–400; padding 12 × 14; radio 8; elevation 2; línea 1: icono 16 — mensaje label-lg — cierre 24; línea 2: detalle/acción; tono loading | Antes: tarjeta de 360px con columna de icono y elevation 3. |
| Tooltip | Superficie inversa; body-sm 13/1.4; padding 6 × 8; radio 5; máx. 240; sin sombra ni icono | Más compacto y sin aspecto de tarjeta. |
| Popover | Elevation 2; radio 12; cuerpo 16 (título label-lg + contenido); pie separado por divisor con 1 secundaria + texto; cierre opcional | Título Inter en lugar de Outfit; acciones en región propia. |
| Tabs · primary | 40px; gap 24; label-lg 500; indicador 2px ink bajo la etiqueta; contador como metadato data-sm secundario | Sin cuadro de contador ni icono fill. |
| Tabs · secondary | 32px; gap 16; label-md; selección por contraste + peso; sin subrayado | Nueva jerarquía secundaria. |
| MenuItem | 36px; padding 0 12; radio 5; icono 16; gap 10; body-md; atajo caption; hover neutro; foco teclado = superficie activa + indicador 2px ink; seleccionado = check + 500; destructivo sin fondo rojo | Sin anillo coral alrededor de la fila. |
| Tag | 20px; caption 12/500 secundario; radio 3; subtle (tinte neutro), outline, plain | Antes con borde por defecto; ahora metadato silencioso. |
| Chip | 32px; radio 5; padding 12; label-md; default sin relleno + borde de control; selected = relleno ink (única estrategia); quitar en zona separada por divisor | Sin fondo + borde + check coral. |
| Counter | text (número tabular secundario, por defecto) · subtle (18px tinte neutro) | Sin bloques negros. |
| NotificationIndicator | Punto 8px (existencia) o número 16px (cantidad), anclado arriba a la derecha sin alterar el tamaño; tono brand (no leído) / info / warning / ai | Contador más pequeño; tono por significado. |
| Progress | linear (4px) · steps (segmentos + etiquetas + ✓) · indeterminate (2px + texto) · ratio (una marca por entidad) | Cuatro formas según lo que se mide. |
Pendientes de revisión estética: el resto de componentes de 05A.

## 12. Navigation System — Sidebar unificado
Componentes: `components/navigation/` (Sidebar, SidebarItem, MobileNavDrawer; internos navShared, logo). Tokens: `tokens/navigation.css` (alias de tokens aprobados + movimiento). Sustituye a la arquitectura Dual-Layer (rail + panel).
| Token | Light | Dark |
|---|---|---|
| --nav-bg | canvas #F0F1F2 | surface |
| --nav-fg / --nav-fg-strong | text-secondary / text-primary | text-secondary / text-primary |
| --nav-accent (línea activa, icono activo) | brand | brand |
| --nav-indicator-hover (línea de hover) | brand-300 | brand-700 |
| --nav-divider | border | border |
Geometría: 256 / 68 · padding 20 (12 colapsado) · filas 46, separación 6 · Phosphor 20 — 14 — Inter 15 (400 / 600) · contadores 12 tabulares.
Indicador único: línea inferior de 2px, 75% de la etiqueta, desde la izquierda. Hover 220 ms (0.22,1,0.36,1) / salida 160 ms (0.4,0,0.2,1); cambio de destino 140 ms de salida + 220 ms de entrada con 60 ms de retraso. Sin fondo, píldora ni línea lateral. Colapsado: trazo 14 × 2 bajo el icono.
**Decisión:** en colapsado, el logotipo actúa como control de expansión (muestra sidebar-simple con hover/foco) para no apilar controles ni desplazar los destinos.
**Decisión:** el peso 600 del activo tiene el ancho reservado, por lo que el cambio de peso no mueve contadores ni línea.
