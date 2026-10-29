# Quoly 2.0 · Iconografía y lenguaje gráfico
**Fase 04. Familia oficial: Phosphor Icons** (@phosphor-icons/core 2.1.1, MIT) + dos símbolos originales Quoly. Fases 01–03 sin cambios.

Recursos: `assets/icons/quoly-icons.js` (solo el vocabulario seleccionado, SVG originales sin modificar, pesos regular/bold/fill/duotone; light en 6 iconos de diagrama) · tokens `tokens/icons.css` · guía visual: grupo **Iconography**.
Uso: `qIcon(name,{weight,size,label})` devuelve un SVG; `<i data-i="receipt" data-w="regular" data-s="16"></i>` se hidrata al cargar. Sin `label` → `aria-hidden`; con `label` → `role="img"` + `aria-label`.

## 1. Filosofía
Los iconos ayudan a reconocer, no sustituyen el texto. Lineales, geométricos, un solo peso por grupo, sin contenedores de color. La riqueza cromática queda en visualización de datos; los iconos usan neutros y colores semánticos.

## 2. Pesos
| Peso | Uso |
|---|---|
| Regular | Predeterminado (16–24px): navegación, acciones, menús, formularios, tablas, indicadores. |
| Bold | Obligatorio a 12px. Énfasis puntual (marca de confirmado). Máx. uno por grupo. |
| Fill | Estado seleccionado (navegación activa) e iconos de estado semántico (éxito, advertencia, error, información). No todo activo cambia a fill. |
| Duotone | Excepcional: diagramas explicativos y estados vacíos ≥32px. Nunca en controles. |
| Light | Solo ≥32px, para mantener el trazo óptico. |
| Thin | No autorizado. |

## 3. Tamaños y trazo óptico
| Token | px | Peso | Trazo resultante | Uso |
|---|---:|---|---:|---|
| --icon-xs | 12 | bold | 1,13 | Solo glifos simples (check, x, caret, info) con label-sm / caption |
| --icon-sm | 16 | regular | 1,00 | Predeterminado: body-md, label-md, tablas, menús, campos, controles ≤40 |
| --icon-md | 20 | regular | 1,25 | label-lg, controles ≥44, navegación principal, heading-sm |
| --icon-lg | 24 | regular | 1,50 | heading-md/lg, navegación táctil |
| --icon-xl | 32 | light | 1,50 | Estados vacíos, cabeceras de diagrama |
| --icon-2xl | 40 | light | 1,88 | Diagramas explicativos |
| --icon-display | 48 | light | 2,25 | Marketing / onboarding, uno por vista |
El tamaño visual no es el objetivo interactivo: el control aporta el área (mín. 24 × 24, Fase 03).

## 4. Relación con tipografía
| Texto | Icono | Separación |
|---|---|---|
| caption / label-sm 12 | xs 12 bold | 4 (`--icon-gap-inline`) |
| label-md 13 · body-md 14 · body-sm 13 | sm 16 | 6 (`--icon-gap-sm`) |
| label-lg 14 en controles ≥44 · title-lg 18 · heading-sm 20 | md 20 | 8 (`--icon-gap-md`) |
| heading-md 24 · heading-lg 28 | lg 24 | 12 (`--icon-gap-lg`) |
| Figure / Display (Outfit) | xl–display light | 12–16 |
Dentro de texto corrido: icono sm, separación 4. Alineación: una línea → centrado en la caja de línea; varias líneas → el icono se alinea con la primera línea (contenedor de altura = line-height). El trazo regular a 16px (1px) equivale al peso de Inter 400–500 a 13–14px.

## 5. Consistencia óptica
- Rejilla Phosphor 256, zona activa ~16–240. Las compensaciones de formas (círculo, cuadrado, triángulo) vienen de origen: no se reescalan iconos individuales.
- Un peso por grupo; nunca mezclar lineal y sólido salvo el elemento seleccionado (fill) de un conjunto regular.
- No se editan SVG de Phosphor. Ajuste permitido: translate ≤0,5px, documentado por icono. Ninguno necesario en el vocabulario actual.
- Sin contenedores de color alrededor de iconos.

## 6. Catálogo
### A · Navegación y estructura
| Concepto | Phosphor |
|---|---|
| Inicio | `house-simple` |
| Solicitudes | `clipboard-text` |
| Cotizaciones | `receipt` |
| Proveedores | `buildings` |
| Ajustes | `gear-six` |
| Perfil | `user-circle` |
| Menú de navegación | `list` |
| Atrás | `arrow-left` |
| Siguiente | `caret-right` |
| Búsqueda | `magnifying-glass` |
| Filtrado | `funnel-simple` |
| Ordenación | `arrows-down-up` |
| Expandir | `caret-down` |
| Contraer | `caret-up` |
| Más opciones | `dots-three` |
| Cerrar | `x` |
| Enlace externo | `arrow-square-out` |

### B · Solicitudes RFQ
| Concepto | Phosphor |
|---|---|
| Nueva solicitud | `plus` |
| Borrador | `note-pencil` |
| Solicitud abierta | `door-open` |
| Solicitud cerrada | `lock-simple` |
| Enviar solicitud | `paper-plane-tilt` |
| Copiar solicitud | `copy` |
| Fecha límite | `clock-countdown` |
| Proveedor invitado | `user-plus` |
| Esperando respuesta | `hourglass-medium` |

### C · Comunicaciones
| Concepto | Phosphor |
|---|---|
| Correo | `at` |
| Mensaje recibido | `tray-arrow-down` |
| Respuesta | `arrow-bend-up-left` |
| Pregunta del proveedor | `question` |
| Aclaración | `chat-text` |
| Documento adjunto | `paperclip` |
| Mensaje procesado | `envelope-simple-open` |
| Revisión pendiente | `eye` |
| Enviar respuesta | `paper-plane-right` |

### D · Cotizaciones
| Concepto | Phosphor |
|---|---|
| Cotización | `receipt` |
| Precio | `tag` |
| Moneda | `coins` |
| Cantidad | `hash` |
| MOQ | `stack` |
| Lead time | `truck` |
| Condiciones comerciales | `handshake` |
| Validez | `calendar-check` |
| Información faltante | `circle-dashed` |
| Revisar valor | `magnifying-glass-plus` |
| Confirmar extracción | `check` |
| Editar valor | `pencil-simple` |

### E · Comparación
| Concepto | Phosphor |
|---|---|
| Comparar | `columns` |
| Diferencia | `plus-minus` |
| Precio comparable | `equals` |
| Oferta no comparable | `not-equals` |
| Mejor precio | `arrow-down` |
| Lead time más corto | `timer` |
| Información incompleta | `circle-half` |
| Evidencia técnica | `file-magnifying-glass` |
| Adjudicación | `stamp` |
| Exportar decisión | `export` |

### F · Inteligencia artificial
| Concepto | Phosphor |
|---|---|
| Extracción mediante IA / atribución IA / información extraída | `quoly-intelligence` (Quoly Intelligence Graph) |
| Información propuesta · dato pendiente de revisión | `quoly-proposed` (grafo, nodos vacíos) |
| Evidencia identificada | `highlighter-circle` |
| Resumen generado | `article` |
| Sugerencia de respuesta | `chat-circle-text` |
| Confirmación humana | `user-check` |

### G · Estados y feedback
| Concepto | Phosphor |
|---|---|
| Éxito | `check-circle` |
| Advertencia | `warning` |
| Error | `x-circle` |
| Información | `info` |
| Pendiente | `clock` |
| Procesando | `circle-notch` |
| Completado | `checks` |
| No disponible | `minus-circle` |
| Deshabilitado | `prohibit` |
| Acción requerida | `flag` |

### H · Archivos e integraciones
| Concepto | Phosphor |
|---|---|
| PDF | `file-pdf` |
| Excel | `file-xls` |
| Word | `file-doc` |
| Imagen | `file-image` |
| Archivo | `file` |
| Descargar | `download-simple` |
| Subir | `upload-simple` |
| Gmail (Google) | `google-logo` |
| Outlook | `microsoft-outlook-logo` |
| Buzón conectado | `plugs-connected` |
| Buzón desconectado | `plugs` |

### I · Acciones generales
| Concepto | Phosphor |
|---|---|
| Eliminar (destructiva) | `trash` |
| Deshacer | `arrow-counter-clockwise` |
| Calendario | `calendar-blank` |
| Enlace | `link-simple` |
| Ocultar | `eye-slash` |

### Reglas de significado
- Mismo concepto → mismo icono en todo el producto; conceptos distintos → iconos distintos. Excepciones deliberadas: `receipt` = cotización (navegación y objeto), `paperclip` = adjunto (documento o archivo).
- `check` es la acción de confirmar y la marca de confirmado; `check-circle` es feedback de éxito del sistema; `checks` es “completado”.
- `trash` solo para eliminar (destructiva, siempre con texto o confirmación); `x` solo cerrar/quitar sin pérdida de datos.
- `arrow-down` (mejor precio) y `timer` (lead time más corto) describen el criterio, no recomiendan: nunca sin la etiqueta del criterio.
- `stamp` (adjudicación) registra la decisión del comprador; no usa color de éxito.
- `google-logo` / `microsoft-outlook-logo`: siempre con el nombre del servicio.
- `circle-notch` (procesando) gira con `--dur-ui`; respeta `prefers-reduced-motion`.

## 7. Reglas semánticas
Un estado importante nunca se comunica solo con un icono · las advertencias llevan contexto · las acciones destructivas usan `trash` + texto + color error solo en confirmación · los iconos decorativos no compiten con datos (`--icon-color-muted`, nunca junto a cifras) · metáforas de procurement ambiguas se resuelven con texto, no con un icono nuevo.

## 8. Color
| Rol | Token | Fase 01 |
|---|---|---|
| Principal | --icon-color-primary | text-primary |
| Secundario / interactivo en reposo | --icon-color-secondary · --icon-color-interactive | text-secondary |
| Interactivo hover | --icon-color-interactive-hover | text-primary |
| Atenuado (solo decorativo) | --icon-color-muted | text-muted |
| Seleccionado | --icon-color-selected + peso fill | text-primary |
| Deshabilitado | --icon-color-disabled | disabled-fg |
| Sobre acción principal | --icon-color-on-brand | text-on-brand |
| Éxito / advertencia / error / información / neutral | --icon-color-success…neutral | status-*-text |
| IA (extraído, pendiente) | --icon-color-ai | data-proposed-text (AI Review) |
| Confirmado / corregido | --icon-color-confirmed / --icon-color-edited | data-confirmed-mark / data-edited-mark |
- El coral de marca no colorea iconos: solo aparece heredado dentro de la acción principal.
- Colorfield nunca colorea iconos ni sustituye estados.
- Contraste: los iconos esenciales cumplen ≥3:1 (los roles primary, secondary, status-* y ai superan 4,5:1 sobre surface y canvas en ambos modos; ver Fase 01 §9). muted y disabled no se usan para iconos esenciales.

## 9. Quoly Intelligence
Símbolo: **Quoly Intelligence Graph** (aprobado en 05C.2; sustituye al antiguo marco de esquinas + rombo, retirado en 06C). Rejilla 24: nodos A(5,12) B(11,5) C(19,9) D(15,19); aristas A–B, B–C, C–D, D–A, B–D; trazo 1.6, extremos y uniones redondos, nodos r 2; color AI Review; sin contenedor, fondo, rombo ni esquinas. Legible a 16, 20, 24 y 32. Componente canónico `IntelligenceMark` (variant extracted | proposed); `Icon name="quoly-intelligence" | "quoly-proposed"` delega en él.
| Estado | Icono | Color | Forma |
|---|---|---|---|
| Extraído por IA / atribución IA | `quoly-intelligence` | --icon-color-ai | grafo, nodos sólidos |
| Propuesto · pendiente de revisión | `quoly-proposed` | --icon-color-ai | grafo, nodos vacíos |
| Corregido por el comprador | `pencil-simple` | --icon-color-edited | sin grafo IA |
| Confirmado por el comprador | `check` (bold) | --icon-color-confirmed | sin grafo IA |
Al confirmar o corregir, el símbolo IA se retira: nunca coexiste con la marca de confirmado. Siempre con etiqueta textual o nombre accesible. Los estados se distinguen por forma además de color.

## 10. Lenguaje gráfico e ilustración
- Solo diagramas con significado real: respuesta → interpretación → revisión → confirmación → comparación; estados vacíos.
- Construcción: iconos del vocabulario a 32–48px light o duotone, conectores de 1px `border-strong`, rejilla y espaciado de Fase 03. Una ilustración por vista como máximo.
- Color: neutros; AI Review solo en el paso de IA; Colorfield solo en visualizaciones.
- Prohibido: 3D, sombras en iconos, glassmorphism, gradientes, emojis, iconos en cuadrados de color sistemáticos, ilustraciones repetidas por sección, gráficos que compitan con datos.

## 11. Accesibilidad
Iconos decorativos `aria-hidden`; funcionales sin texto visible con `aria-label` y tooltip · iconos esenciales ≥3:1 (1.4.11) · los estados combinan forma (fill, nodos sólidos/vacíos, check) + color + texto · objetivo ≥24 × 24 · 12px solo para glifos simples no esenciales · mismas metáforas en light y dark (solo cambia el color vía tokens).

## 12. Conflictos documentados (sin modificar fases aprobadas)
- **Tamaños:** Fase 03 definió `--size-icon-xs…2xl` (12/14/16/20/24/32). La escala aprobada aquí es `--icon-*` (12/16/20/24/32/40/48). Se propone retirar `--size-icon-*` al migrar componentes; no se ha tocado `tokens/spacing.css`.
- **Componente Icon:** sigue usando Lucide. Se migra a `quoly-icons.js` en la fase de componentes.

## 13. Obsoleto
Lucide como sustituto (readme anterior) · trazo único 2px/24 · tamaños 14–16 sin escala · color heredado sin roles · ausencia de símbolo IA · flechas Unicode como iconos (se mantienen solo como tipografía en texto).
