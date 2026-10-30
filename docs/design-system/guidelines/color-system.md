# Quoly 2.0 · Sistema cromático
**Dirección vigente: Chromatic Graphite + Colorfield.** Fase 01 del rediseño. Sustituye por completo a Graphite + Ice Blue (ver §11).

Fuente de verdad de valores: `tokens/colors.css`. Tarjetas de revisión: grupo **Colors** del Design System (`guidelines/colors-*.html`).

## 1. Arquitectura
Tres capas:
1. **Primitivas** `--q-<familia>-<paso>`: valores, constantes en ambos modos. Nunca se usan directamente en componentes.
2. **Tokens semánticos** `--color-<rol>`: roles; cambian de valor con `data-theme="light" | "dark"` (`:root` = light).
3. **Visualización** `--color-dv-*`: Colorfield y elementos de gráfica, independientes de los estados.

Tres sistemas que no se mezclan:
- **Chromatic Graphite** — estructura: neutros fríos + coral de marca.
- **Semántico** — Success, Warning, Error, Information, AI Review, Neutral.
- **Colorfield** — 8 categorías para datos. Sin significado de estado.

## 2. Decisiones tomadas
- **Escalas en OKLCH.** 11 pasos (50–950) con luminosidad perceptual fija por paso; tono y croma del valor aprobado; croma reducida hacia los extremos y recortada a gamut sRGB. Los valores aprobados se fijan en el paso más cercano (marcados ◆ en las tarjetas) y no se alteran.
- **Neutral de 17 pasos** construido alrededor de los 12 valores estructurales aprobados. Pasos calculados: 200 (intermedio), 350 (texto atenuado dark, ≥4.6:1 sobre 850), 400 (≥4.7:1 sobre #1B1C22 y ≥3:1 sobre canvas light → límite de controles), 500 (texto atenuado light, ≥4.7:1 sobre canvas), 850 (hover dark).
- **Acción principal = coral con texto oscuro** en ambos modos. Blanco sobre #F34D64 da 3.47:1 (✕). #15171D sobre #F34D64 da 5.17:1. En dark #0D0E12 sobre #FF687C.
- **Hover de la acción principal se aclara** (brand-400 / brand-300) para mantener el texto oscuro ≥4.5:1; pressed usa brand-550 (light, calculado a 4.6:1) y brand-500 (dark).
- **La marca no es color de texto.** Los enlaces usan el color del texto con subrayado coral (1px, 2px en hover). Así el coral nunca compite con el rojo de error, cuyo tono es cercano (≈ mismo matiz OKLCH).
- **Foco:** brand-600 en light (≥3:1 sobre canvas, surface, elevated y selección); brand-400 en dark.
- **Superficie elevada light (#E5E7EA) es más oscura que surface:** la elevación se expresa por tono, no por luminosidad. En dark la elevación sube en claridad (#1B1C22 → #303038).
- **Dark mode propio:** fondos de estado = mezcla OKLab de #1B1C22 con el color de estado (16 % sutil, 30 % fondo, 42 % borde) — tintes profundos en lugar de pasteles invertidos.
- **Colorfield en light:** relleno = color base aprobado; líneas, puntos y bordes de barra usan una variante `-line` oscurecida hasta ≥3:1 sobre surface y canvas. En dark el base ya supera 3:1 y se usa tal cual.
- **Orden categórico** calculado maximizando la distancia ΔE OKLab mínima (visión normal, deuteranopía y protanopía): 1 Violeta, 2 Amarillo, 3 Turquesa, 4 Coral, 5 Azul, 6 Oliva, 7 Rosa, 8 Menta.

## 3. Colores estructurales aprobados
| Rol | Light | Dark | Token |
|---|---|---|---|
| Canvas | #F0F1F2 | #0D0E12 | `--color-canvas` |
| Superficie principal | #FFFFFF | #1B1C22 | `--color-surface` |
| Superficie elevada | #E5E7EA | #303038 | `--color-surface-elevated` |
| Texto principal | #15171D | #F6F6F7 | `--color-text-primary` |
| Texto secundario | #5C606A | #BEC0CB | `--color-text-secondary` |
| Bordes | #D8DBE0 | #42444F | `--color-border` |
| Marca | #F34D64 | #FF687C | `--color-brand` |
| Selección | #FFE5E9 | #43222C | `--color-selection-bg` |

## 4. Primitivas
### Neutral · Chromatic Graphite
| Token | HEX |
|---|---|
| `--q-neutral-0` | `#FFFFFF` |
| `--q-neutral-25` | `#F6F6F7` |
| `--q-neutral-50` | `#F0F1F2` |
| `--q-neutral-100` | `#E5E7EA` |
| `--q-neutral-150` | `#D8DBE0` |
| `--q-neutral-200` | `#CBCDD5` |
| `--q-neutral-300` | `#BEC0CB` |
| `--q-neutral-350` | `#8B8E98` |
| `--q-neutral-400` | `#838791` |
| `--q-neutral-500` | `#676B76` |
| `--q-neutral-600` | `#5C606A` |
| `--q-neutral-700` | `#42444F` |
| `--q-neutral-800` | `#303038` |
| `--q-neutral-850` | `#25262D` |
| `--q-neutral-900` | `#1B1C22` |
| `--q-neutral-950` | `#15171D` |
| `--q-neutral-1000` | `#0D0E12` |

### Marca
| Token | HEX |
|---|---|
| `--q-brand-50` | `#FFF4F4` |
| `--q-brand-100` | `#FFE5E9` |
| `--q-brand-200` | `#FFCCCD` |
| `--q-brand-300` | `#FFACAF` |
| `--q-brand-400` | `#FF687C` |
| `--q-brand-500` | `#F34D64` |
| `--q-brand-550` | `#E9435C` |
| `--q-brand-600` | `#DC3652` |
| `--q-brand-700` | `#BA2240` |
| `--q-brand-800` | `#92162F` |
| `--q-brand-900` | `#6A1122` |
| `--q-brand-950` | `#43222C` |

### Success
| Token | HEX |
|---|---|
| `--q-success-50` | `#F0FAF3` |
| `--q-success-100` | `#DFF3E6` |
| `--q-success-200` | `#C2E5CF` |
| `--q-success-300` | `#68D79E` |
| `--q-success-400` | `#79C097` |
| `--q-success-500` | `#58AA7D` |
| `--q-success-600` | `#3E9266` |
| `--q-success-700` | `#237A50` |
| `--q-success-800` | `#1F5D3E` |
| `--q-success-900` | `#17432C` |
| `--q-success-950` | `#0F2D1D` |
| `--q-success-d1` | `#1F2A29` |
| `--q-success-d2` | `#223630` |
| `--q-success-d3` | `#3D6453` |

### Warning
| Token | HEX |
|---|---|
| `--q-warning-50` | `#FDF5ED` |
| `--q-warning-100` | `#FAEAD9` |
| `--q-warning-200` | `#F2D5B7` |
| `--q-warning-300` | `#F5C15D` |
| `--q-warning-400` | `#D7A265` |
| `--q-warning-500` | `#C48940` |
| `--q-warning-600` | `#AA7123` |
| `--q-warning-700` | `#955D00` |
| `--q-warning-800` | `#6F4508` |
| `--q-warning-900` | `#503208` |
| `--q-warning-950` | `#362106` |
| `--q-warning-d1` | `#2D2624` |
| `--q-warning-d2` | `#3D2F24` |
| `--q-warning-d3` | `#6E5C3F` |

### Error
| Token | HEX |
|---|---|
| `--q-error-50` | `#FFF4F3` |
| `--q-error-100` | `#FFE6E5` |
| `--q-error-200` | `#FFCCCB` |
| `--q-error-300` | `#FFACAC` |
| `--q-error-400` | `#FF8997` |
| `--q-error-500` | `#ED636A` |
| `--q-error-600` | `#D14953` |
| `--q-error-700` | `#B72F3E` |
| `--q-error-800` | `#8A2730` |
| `--q-error-900` | `#641C22` |
| `--q-error-950` | `#451316` |
| `--q-error-d1` | `#332227` |
| `--q-error-d2` | `#48262C` |
| `--q-error-d3` | `#734850` |

### Information
| Token | HEX |
|---|---|
| `--q-info-50` | `#F2F7FF` |
| `--q-info-100` | `#E2EEFF` |
| `--q-info-200` | `#C4DDFF` |
| `--q-info-300` | `#A1C8FF` |
| `--q-info-400` | `#80B7FF` |
| `--q-info-500` | `#5597F2` |
| `--q-info-600` | `#3D7ED6` |
| `--q-info-700` | `#2466BC` |
| `--q-info-800` | `#1F4F8F` |
| `--q-info-900` | `#163967` |
| `--q-info-950` | `#0E2647` |
| `--q-info-d1` | `#1F2738` |
| `--q-info-d2` | `#21324C` |
| `--q-info-d3` | `#435876` |

### AI Review
| Token | HEX |
|---|---|
| `--q-ai-50` | `#F7F5FF` |
| `--q-ai-100` | `#EDEAFF` |
| `--q-ai-200` | `#DCD4FF` |
| `--q-ai-300` | `#C8BAFF` |
| `--q-ai-400` | `#B497FF` |
| `--q-ai-500` | `#9D7DF8` |
| `--q-ai-600` | `#8664DC` |
| `--q-ai-700` | `#6843B9` |
| `--q-ai-800` | `#553B93` |
| `--q-ai-900` | `#3D2B6A` |
| `--q-ai-950` | `#291D49` |
| `--q-ai-d1` | `#262338` |
| `--q-ai-d2` | `#30294C` |
| `--q-ai-d3` | `#564C76` |

`-d1/-d2/-d3`: tintes de estado para dark (fondo sutil, fondo, borde).

### Colorfield · Violeta
| Token | HEX |
|---|---|
| `--q-cf-violet-50` | `#F7F5FF` |
| `--q-cf-violet-100` | `#EDEAFF` |
| `--q-cf-violet-200` | `#DBD5FF` |
| `--q-cf-violet-300` | `#C6BBFF` |
| `--q-cf-violet-400` | `#B09DFB` |
| `--q-cf-violet-500` | `#9A83EC` |
| `--q-cf-violet-600` | `#826AD1` |
| `--q-cf-violet-700` | `#6B55B0` |
| `--q-cf-violet-800` | `#52408A` |
| `--q-cf-violet-900` | `#3B2E64` |
| `--q-cf-violet-950` | `#281F45` |
| `--q-cf-violet-line` | `#927CE0` |
| `--q-cf-violet-hover` | `#9680E7` |
| `--q-cf-violet-dim` | `#DDD8FB` |
| `--q-cf-violet-line-d` | `#9A83EC` |
| `--q-cf-violet-hover-d` | `#BDB1F6` |
| `--q-cf-violet-dim-d` | `#403B5C` |

### Colorfield · Coral
| Token | HEX |
|---|---|
| `--q-cf-coral-50` | `#FFF4F2` |
| `--q-cf-coral-100` | `#FFE6E2` |
| `--q-cf-coral-200` | `#FFCDC5` |
| `--q-cf-coral-300` | `#FBB0A4` |
| `--q-cf-coral-400` | `#F58B7B` |
| `--q-cf-coral-500` | `#DC7565` |
| `--q-cf-coral-600` | `#C15C4E` |
| `--q-cf-coral-700` | `#A1483C` |
| `--q-cf-coral-800` | `#7F362C` |
| `--q-cf-coral-900` | `#5C2720` |
| `--q-cf-coral-950` | `#3F1A15` |
| `--q-cf-coral-line` | `#CD7264` |
| `--q-cf-coral-hover` | `#E38071` |
| `--q-cf-coral-dim` | `#FFDBD4` |
| `--q-cf-coral-line-d` | `#F58B7B` |
| `--q-cf-coral-hover-d` | `#FCB6AA` |
| `--q-cf-coral-dim-d` | `#5A3E3E` |

### Colorfield · Amarillo
| Token | HEX |
|---|---|
| `--q-cf-yellow-50` | `#FCF6EB` |
| `--q-cf-yellow-100` | `#F8EBD5` |
| `--q-cf-yellow-200` | `#EED8B0` |
| `--q-cf-yellow-300` | `#F0BF5C` |
| `--q-cf-yellow-400` | `#D1A753` |
| `--q-cf-yellow-500` | `#BD8E22` |
| `--q-cf-yellow-600` | `#A27600` |
| `--q-cf-yellow-700` | `#856100` |
| `--q-cf-yellow-800` | `#674A00` |
| `--q-cf-yellow-900` | `#4B3500` |
| `--q-cf-yellow-950` | `#342300` |
| `--q-cf-yellow-line` | `#AB8539` |
| `--q-cf-yellow-hover` | `#D0A44C` |
| `--q-cf-yellow-dim` | `#FBEBCE` |
| `--q-cf-yellow-line-d` | `#F0BF5C` |
| `--q-cf-yellow-hover-d` | `#F5D69A` |
| `--q-cf-yellow-dim-d` | `#574B38` |

### Colorfield · Menta
| Token | HEX |
|---|---|
| `--q-cf-mint-50` | `#EFFAF6` |
| `--q-cf-mint-100` | `#DDF3EB` |
| `--q-cf-mint-200` | `#BEE5D7` |
| `--q-cf-mint-300` | `#99D4C1` |
| `--q-cf-mint-400` | `#5CB99E` |
| `--q-cf-mint-500` | `#4DAA90` |
| `--q-cf-mint-600` | `#309278` |
| `--q-cf-mint-700` | `#1D7862` |
| `--q-cf-mint-800` | `#125D4B` |
| `--q-cf-mint-900` | `#0F4336` |
| `--q-cf-mint-950` | `#0A2D24` |
| `--q-cf-mint-line` | `#4A9983` |
| `--q-cf-mint-hover` | `#54AA92` |
| `--q-cf-mint-dim` | `#CEE9DF` |
| `--q-cf-mint-line-d` | `#5CB99E` |
| `--q-cf-mint-hover-d` | `#9BD3C0` |
| `--q-cf-mint-dim-d` | `#314946` |

### Colorfield · Azul
| Token | HEX |
|---|---|
| `--q-cf-blue-50` | `#F2F7FF` |
| `--q-cf-blue-100` | `#E2EEFF` |
| `--q-cf-blue-200` | `#C5DDFF` |
| `--q-cf-blue-300` | `#A2C8FF` |
| `--q-cf-blue-400` | `#7FB0F7` |
| `--q-cf-blue-500` | `#649BEB` |
| `--q-cf-blue-600` | `#497FCC` |
| `--q-cf-blue-700` | `#3767AC` |
| `--q-cf-blue-800` | `#284F87` |
| `--q-cf-blue-900` | `#1D3962` |
| `--q-cf-blue-950` | `#132643` |
| `--q-cf-blue-line` | `#5A8CD6` |
| `--q-cf-blue-hover` | `#5F94E2` |
| `--q-cf-blue-dim` | `#CDDFFB` |
| `--q-cf-blue-line-d` | `#649BEB` |
| `--q-cf-blue-hover-d` | `#9DC0F5` |
| `--q-cf-blue-dim-d` | `#32415C` |

### Colorfield · Rosa
| Token | HEX |
|---|---|
| `--q-cf-pink-50` | `#FDF4F9` |
| `--q-cf-pink-100` | `#FAE6F2` |
| `--q-cf-pink-200` | `#F2CFE4` |
| `--q-cf-pink-300` | `#E7B4D4` |
| `--q-cf-pink-400` | `#E39AC9` |
| `--q-cf-pink-500` | `#C37CAA` |
| `--q-cf-pink-600` | `#A96491` |
| `--q-cf-pink-700` | `#8C5078` |
| `--q-cf-pink-800` | `#6E3D5D` |
| `--q-cf-pink-900` | `#4F2B43` |
| `--q-cf-pink-950` | `#361D2D` |
| `--q-cf-pink-line` | `#B5789F` |
| `--q-cf-pink-hover` | `#CE8BB6` |
| `--q-cf-pink-dim` | `#F8DFEE` |
| `--q-cf-pink-line-d` | `#E39AC9` |
| `--q-cf-pink-hover-d` | `#EFBEDC` |
| `--q-cf-pink-dim-d` | `#544152` |

### Colorfield · Oliva
| Token | HEX |
|---|---|
| `--q-cf-olive-50` | `#F5F8EE` |
| `--q-cf-olive-100` | `#E9F0DB` |
| `--q-cf-olive-200` | `#D4E1BA` |
| `--q-cf-olive-300` | `#BCCF94` |
| `--q-cf-olive-400` | `#A4BD64` |
| `--q-cf-olive-500` | `#8AA249` |
| `--q-cf-olive-600` | `#738A2F` |
| `--q-cf-olive-700` | `#5D711E` |
| `--q-cf-olive-800` | `#475713` |
| `--q-cf-olive-900` | `#333F0F` |
| `--q-cf-olive-950` | `#222A09` |
| `--q-cf-olive-line` | `#7F934A` |
| `--q-cf-olive-hover` | `#93AA58` |
| `--q-cf-olive-dim` | `#E1EACE` |
| `--q-cf-olive-line-d` | `#A4BD64` |
| `--q-cf-olive-hover-d` | `#C4D59D` |
| `--q-cf-olive-dim-d` | `#424B39` |

### Colorfield · Turquesa
| Token | HEX |
|---|---|
| `--q-cf-teal-50` | `#EFF9F9` |
| `--q-cf-teal-100` | `#DCF2F2` |
| `--q-cf-teal-200` | `#BCE4E5` |
| `--q-cf-teal-300` | `#96D3D4` |
| `--q-cf-teal-400` | `#5EBFC2` |
| `--q-cf-teal-500` | `#45A8AB` |
| `--q-cf-teal-600` | `#268F92` |
| `--q-cf-teal-700` | `#107679` |
| `--q-cf-teal-800` | `#065B5E` |
| `--q-cf-teal-900` | `#084243` |
| `--q-cf-teal-950` | `#062C2E` |
| `--q-cf-teal-line` | `#46979A` |
| `--q-cf-teal-hover` | `#53ADB0` |
| `--q-cf-teal-dim` | `#CFEBEB` |
| `--q-cf-teal-line-d` | `#5EBFC2` |
| `--q-cf-teal-hover-d` | `#9DD6D8` |
| `--q-cf-teal-dim-d` | `#324B50` |

Sufijos Colorfield: `-line` (≥3:1 light), `-hover`, `-dim` (light); `-line-d`, `-hover-d`, `-dim-d` (dark).

## 5. Tokens semánticos
### Superficies
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-canvas` | neutral-50 · #F0F1F2 | neutral-1000 · #0D0E12 | Fondo base de la aplicación, detrás de todas las superficies. |
| `--color-surface` | neutral-0 · #FFFFFF | neutral-900 · #1B1C22 | Superficie principal de contenido (paneles, tablas, hojas). |
| `--color-surface-elevated` | neutral-100 · #E5E7EA | neutral-800 · #303038 | Capa tonal superior: barras, cabeceras de grupo, menús, popovers. Diferencia por tono, no por sombra. |
| `--color-surface-sunken` | neutral-25 · #F6F6F7 | neutral-950 · #15171D | Pozos dentro de una superficie: celdas de evidencia, áreas de código, campos de solo lectura. |
| `--color-surface-hover` | neutral-50 · #F0F1F2 | neutral-850 · #25262D | Hover sobre filas y elementos interactivos situados en surface. |
| `--color-surface-active` | neutral-100 · #E5E7EA | neutral-800 · #303038 | Pressed / fila activa sobre surface. |
| `--color-surface-selected` | brand-100 · #FFE5E9 | brand-950 · #43222C | Fila, celda u opción seleccionada. |
| `--color-surface-inverse` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Superficie de contraste máximo (tooltips, toasts, barras de selección masiva). |
| `--color-scrim` | rgba(13,14,18,.48) | rgba(0,0,0,.64) | Velo detrás de diálogos modales. |

### Texto
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-text-primary` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Texto principal, cifras, valores confirmados. |
| `--color-text-secondary` | neutral-600 · #5C606A | neutral-300 · #BEC0CB | Etiquetas, metadatos, descripciones. |
| `--color-text-muted` | neutral-500 · #676B76 | neutral-350 · #8B8E98 | Texto atenuado: placeholders, marcas de tiempo, notas. No usar sobre surface-elevated (light) — usar text-secondary. |
| `--color-text-disabled` | neutral-400 · #838791 | neutral-600 · #5C606A | Texto de controles deshabilitados (exento de WCAG; nunca para información). |
| `--color-text-inverse` | neutral-0 · #FFFFFF | neutral-950 · #15171D | Texto sobre surface-inverse. |
| `--color-text-on-brand` | neutral-950 · #15171D | neutral-1000 · #0D0E12 | Texto sobre rellenos de marca. Nunca blanco. |
| `--color-text-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre rellenos semánticos fuertes (status-*-strong). |

### Marca
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-brand` | brand-500 · #F34D64 | brand-400 · #FF687C | Color de marca: identidad, acción principal, indicadores. No es un estado. |
| `--color-brand-strong` | brand-600 · #DC3652 | brand-300 · #FFACAF | Variante de marca para elementos no textuales que requieren ≥3:1 sobre cualquier superficie. |
| `--color-brand-subtle` | brand-100 · #FFE5E9 | brand-950 · #43222C | Tinte de marca (selección). |

### Acciones
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-action-primary-bg` | brand-500 · #F34D64 | brand-400 · #FF687C | Relleno de la acción principal. |
| `--color-action-primary-bg-hover` | brand-400 · #FF687C | brand-300 · #FFACAF | Hover: se aclara en ambos modos para conservar texto oscuro ≥4.5:1. |
| `--color-action-primary-bg-active` | brand-550 · #E9435C | brand-500 · #F34D64 | Pressed. |
| `--color-action-primary-fg` | neutral-950 · #15171D | neutral-1000 · #0D0E12 | Texto/icono de la acción principal. |
| `--color-action-secondary-bg` | neutral-0 · #FFFFFF | neutral-800 · #303038 | Relleno de la acción secundaria. |
| `--color-action-secondary-bg-hover` | neutral-50 · #F0F1F2 | neutral-700 · #42444F | Hover secundaria. |
| `--color-action-secondary-bg-active` | neutral-100 · #E5E7EA | neutral-850 · #25262D | Pressed secundaria. |
| `--color-action-secondary-fg` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Texto de la acción secundaria. |
| `--color-action-secondary-border` | neutral-400 · #838791 | neutral-500 · #676B76 | Borde de la acción secundaria (≥3:1). |
| `--color-action-ghost-bg-hover` | neutral-50 · #F0F1F2 | neutral-850 · #25262D | Hover de acciones terciarias sin relleno. |
| `--color-action-destructive-bg` | error-700 · #B72F3E | error-400 · #FF8997 | Acción destructiva confirmada (eliminar, descartar respuesta). |
| `--color-action-destructive-bg-hover` | error-800 · #8A2730 | error-300 · #FFACAC | Hover destructiva. |
| `--color-action-destructive-fg` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto destructiva. |

### Enlaces
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-link` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Texto del enlace (mismo color que el texto; se distingue por subrayado). |
| `--color-link-decoration` | brand-500 · #F34D64 | brand-400 · #FF687C | Subrayado 1px del enlace. |
| `--color-link-decoration-hover` | brand-600 · #DC3652 | brand-300 · #FFACAF | Subrayado en hover (2px). |
| `--color-link-visited-decoration` | neutral-400 · #838791 | neutral-500 · #676B76 | Subrayado de enlace visitado (evidencia ya abierta). |

### Bordes y divisores
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-border` | neutral-150 · #D8DBE0 | neutral-700 · #42444F | Borde por defecto de superficies y tablas (decorativo). |
| `--color-divider` | neutral-100 · #E5E7EA | neutral-800 · #303038 | Divisores internos y líneas de fila. |
| `--color-border-strong` | neutral-400 · #838791 | neutral-500 · #676B76 | Límite de controles interactivos (≥3:1, WCAG 1.4.11). |
| `--color-border-strong-on-elevated` | neutral-500 · #676B76 | neutral-350 · #8B8E98 | Límite de controles situados sobre surface-elevated (≥3:1). |
| `--color-border-hover` | neutral-500 · #676B76 | neutral-400 · #838791 | Borde de control en hover. |
| `--color-border-structural` | neutral-950 · #15171D | neutral-300 · #BEC0CB | Reglas estructurales fuertes (encabezados de comparación, totales). |

### Foco y selección
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-focus-ring` | brand-600 · #DC3652 | brand-400 · #FF687C | Anillo de foco 2px con 2px de separación; ≥3:1 sobre canvas, surface y elevated. |
| `--color-focus-ring-offset` | neutral-0 · #FFFFFF | neutral-900 · #1B1C22 | Color del hueco entre elemento y anillo. |
| `--color-selection-bg` | brand-100 · #FFE5E9 | brand-950 · #43222C | Fondo de elemento seleccionado. |
| `--color-selection-indicator` | brand-600 · #DC3652 | brand-400 · #FF687C | Barra/marca de selección (≥3:1 sobre selection-bg). |
| `--color-selection-text` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Texto sobre selection-bg. |
| `--color-text-selection-bg` | brand-200 · #FFCCCD | brand-900 · #6A1122 | ::selection del navegador. |

### Deshabilitado
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-disabled-bg` | neutral-100 · #E5E7EA | neutral-850 · #25262D | Fondo de control deshabilitado. |
| `--color-disabled-fg` | neutral-400 · #838791 | neutral-600 · #5C606A | Texto/icono deshabilitado. |
| `--color-disabled-border` | neutral-150 · #D8DBE0 | neutral-800 · #303038 | Borde deshabilitado. |

### Estados
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-status-success-text` | success-700 · #237A50 | success-300 · #68D79E | Texto e icono Éxito. |
| `--color-status-success-bg-subtle` | success-50 · #F0FAF3 | success-d1 · #1F2A29 | Fondo sutil Éxito (filas, celdas). |
| `--color-status-success-bg` | success-100 · #DFF3E6 | success-d2 · #223630 | Fondo Éxito (avisos, etiquetas). |
| `--color-status-success-border` | success-300 · #68D79E | success-d3 · #3D6453 | Borde Éxito. |
| `--color-status-success-strong` | success-700 · #237A50 | success-300 · #68D79E | Relleno de máximo énfasis Éxito. |
| `--color-status-success-strong-hover` | success-800 · #1F5D3E | success-200 · #C2E5CF | Hover del relleno fuerte. |
| `--color-status-success-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre relleno fuerte. |
| `--color-status-warning-text` | warning-700 · #955D00 | warning-300 · #F5C15D | Texto e icono Advertencia. |
| `--color-status-warning-bg-subtle` | warning-50 · #FDF5ED | warning-d1 · #2D2624 | Fondo sutil Advertencia (filas, celdas). |
| `--color-status-warning-bg` | warning-100 · #FAEAD9 | warning-d2 · #3D2F24 | Fondo Advertencia (avisos, etiquetas). |
| `--color-status-warning-border` | warning-300 · #F5C15D | warning-d3 · #6E5C3F | Borde Advertencia. |
| `--color-status-warning-strong` | warning-700 · #955D00 | warning-300 · #F5C15D | Relleno de máximo énfasis Advertencia. |
| `--color-status-warning-strong-hover` | warning-800 · #6F4508 | warning-200 · #F2D5B7 | Hover del relleno fuerte. |
| `--color-status-warning-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre relleno fuerte. |
| `--color-status-error-text` | error-700 · #B72F3E | error-400 · #FF8997 | Texto e icono Error. |
| `--color-status-error-bg-subtle` | error-50 · #FFF4F3 | error-d1 · #332227 | Fondo sutil Error (filas, celdas). |
| `--color-status-error-bg` | error-100 · #FFE6E5 | error-d2 · #48262C | Fondo Error (avisos, etiquetas). |
| `--color-status-error-border` | error-300 · #FFACAC | error-d3 · #734850 | Borde Error. |
| `--color-status-error-strong` | error-700 · #B72F3E | error-400 · #FF8997 | Relleno de máximo énfasis Error. |
| `--color-status-error-strong-hover` | error-800 · #8A2730 | error-300 · #FFACAC | Hover del relleno fuerte. |
| `--color-status-error-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre relleno fuerte. |
| `--color-status-info-text` | info-700 · #2466BC | info-400 · #80B7FF | Texto e icono Información. |
| `--color-status-info-bg-subtle` | info-50 · #F2F7FF | info-d1 · #1F2738 | Fondo sutil Información (filas, celdas). |
| `--color-status-info-bg` | info-100 · #E2EEFF | info-d2 · #21324C | Fondo Información (avisos, etiquetas). |
| `--color-status-info-border` | info-300 · #A1C8FF | info-d3 · #435876 | Borde Información. |
| `--color-status-info-strong` | info-700 · #2466BC | info-400 · #80B7FF | Relleno de máximo énfasis Información. |
| `--color-status-info-strong-hover` | info-800 · #1F4F8F | info-300 · #A1C8FF | Hover del relleno fuerte. |
| `--color-status-info-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre relleno fuerte. |
| `--color-status-ai-text` | ai-700 · #6843B9 | ai-400 · #B497FF | Texto e icono Revisión IA. |
| `--color-status-ai-bg-subtle` | ai-50 · #F7F5FF | ai-d1 · #262338 | Fondo sutil Revisión IA (filas, celdas). |
| `--color-status-ai-bg` | ai-100 · #EDEAFF | ai-d2 · #30294C | Fondo Revisión IA (avisos, etiquetas). |
| `--color-status-ai-border` | ai-300 · #C8BAFF | ai-d3 · #564C76 | Borde Revisión IA. |
| `--color-status-ai-strong` | ai-700 · #6843B9 | ai-400 · #B497FF | Relleno de máximo énfasis Revisión IA. |
| `--color-status-ai-strong-hover` | ai-800 · #553B93 | ai-300 · #C8BAFF | Hover del relleno fuerte. |
| `--color-status-ai-on-strong` | neutral-0 · #FFFFFF | neutral-1000 · #0D0E12 | Texto sobre relleno fuerte. |
| `--color-status-neutral-text` | neutral-600 · #5C606A | neutral-300 · #BEC0CB | Estado neutral: borrador, cerrada, sin respuesta. |
| `--color-status-neutral-bg-subtle` | neutral-50 · #F0F1F2 | neutral-850 · #25262D | Fondo sutil neutral. |
| `--color-status-neutral-bg` | neutral-100 · #E5E7EA | neutral-800 · #303038 | Fondo neutral. |
| `--color-status-neutral-border` | neutral-300 · #BEC0CB | neutral-600 · #5C606A | Borde neutral. |
| `--color-status-neutral-strong` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Relleno neutral fuerte (decisión registrada, adjudicada). |
| `--color-status-neutral-on-strong` | neutral-0 · #FFFFFF | neutral-950 · #15171D | Texto sobre neutral fuerte. |

### Datos (procedencia)
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-data-proposed-text` | ai-700 · #6843B9 | ai-400 · #B497FF | Valor propuesto por IA pendiente de revisión. |
| `--color-data-proposed-bg` | ai-50 · #F7F5FF | ai-d1 · #262338 | Fondo de valor propuesto. |
| `--color-data-proposed-border` | ai-300 · #C8BAFF | ai-d3 · #564C76 | Borde discontinuo de valor propuesto. |
| `--color-data-confirmed-text` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Valor confirmado por el comprador (aspecto de dato normal). |
| `--color-data-confirmed-mark` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Marca de verificación de confirmado. |
| `--color-data-edited-mark` | neutral-600 · #5C606A | neutral-300 · #BEC0CB | Indicador “editado por el comprador”. |
| `--color-data-missing-text` | neutral-500 · #676B76 | neutral-350 · #8B8E98 | Texto “No indicado”. |
| `--color-data-missing-bg` | neutral-25 · #F6F6F7 | neutral-950 · #15171D | Fondo de celda sin dato. |
| `--color-data-missing-border` | neutral-300 · #BEC0CB | neutral-600 · #5C606A | Borde discontinuo de dato ausente. |
| `--color-data-noncomparable-bg` | neutral-100 · #E5E7EA | neutral-850 · #25262D | Celda no comparable (otra unidad, Incoterm o alcance). |
| `--color-data-noncomparable-hatch` | neutral-300 · #BEC0CB | neutral-700 · #42444F | Trama diagonal de no comparable. |

### Visualización
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--color-dv-cat-1` | cf-violet-500 · #9A83EC | cf-violet-500 · #9A83EC | Serie 1 · Violeta (relleno). |
| `--color-dv-cat-2` | cf-yellow-300 · #F0BF5C | cf-yellow-300 · #F0BF5C | Serie 2 · Amarillo (relleno). |
| `--color-dv-cat-3` | cf-teal-400 · #5EBFC2 | cf-teal-400 · #5EBFC2 | Serie 3 · Turquesa (relleno). |
| `--color-dv-cat-4` | cf-coral-400 · #F58B7B | cf-coral-400 · #F58B7B | Serie 4 · Coral (relleno). |
| `--color-dv-cat-5` | cf-blue-500 · #649BEB | cf-blue-500 · #649BEB | Serie 5 · Azul (relleno). |
| `--color-dv-cat-6` | cf-olive-400 · #A4BD64 | cf-olive-400 · #A4BD64 | Serie 6 · Oliva (relleno). |
| `--color-dv-cat-7` | cf-pink-400 · #E39AC9 | cf-pink-400 · #E39AC9 | Serie 7 · Rosa (relleno). |
| `--color-dv-cat-8` | cf-mint-400 · #5CB99E | cf-mint-400 · #5CB99E | Serie 8 · Menta (relleno). |
| `--color-dv-cat-1-line` | cf-violet-line · #927CE0 | cf-violet-line-d · #9A83EC | Serie 1 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-2-line` | cf-yellow-line · #AB8539 | cf-yellow-line-d · #F0BF5C | Serie 2 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-3-line` | cf-teal-line · #46979A | cf-teal-line-d · #5EBFC2 | Serie 3 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-4-line` | cf-coral-line · #CD7264 | cf-coral-line-d · #F58B7B | Serie 4 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-5-line` | cf-blue-line · #5A8CD6 | cf-blue-line-d · #649BEB | Serie 5 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-6-line` | cf-olive-line · #7F934A | cf-olive-line-d · #A4BD64 | Serie 6 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-7-line` | cf-pink-line · #B5789F | cf-pink-line-d · #E39AC9 | Serie 7 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-8-line` | cf-mint-line · #4A9983 | cf-mint-line-d · #5CB99E | Serie 8 · línea, punto, borde de barra (≥3:1). |
| `--color-dv-cat-1-hover` | cf-violet-hover · #9680E7 | cf-violet-hover-d · #BDB1F6 | Serie 1 · hover. |
| `--color-dv-cat-2-hover` | cf-yellow-hover · #D0A44C | cf-yellow-hover-d · #F5D69A | Serie 2 · hover. |
| `--color-dv-cat-3-hover` | cf-teal-hover · #53ADB0 | cf-teal-hover-d · #9DD6D8 | Serie 3 · hover. |
| `--color-dv-cat-4-hover` | cf-coral-hover · #E38071 | cf-coral-hover-d · #FCB6AA | Serie 4 · hover. |
| `--color-dv-cat-5-hover` | cf-blue-hover · #5F94E2 | cf-blue-hover-d · #9DC0F5 | Serie 5 · hover. |
| `--color-dv-cat-6-hover` | cf-olive-hover · #93AA58 | cf-olive-hover-d · #C4D59D | Serie 6 · hover. |
| `--color-dv-cat-7-hover` | cf-pink-hover · #CE8BB6 | cf-pink-hover-d · #EFBEDC | Serie 7 · hover. |
| `--color-dv-cat-8-hover` | cf-mint-hover · #54AA92 | cf-mint-hover-d · #9BD3C0 | Serie 8 · hover. |
| `--color-dv-cat-1-dim` | cf-violet-dim · #DDD8FB | cf-violet-dim-d · #403B5C | Serie 1 · atenuada (otra serie enfocada). |
| `--color-dv-cat-2-dim` | cf-yellow-dim · #FBEBCE | cf-yellow-dim-d · #574B38 | Serie 2 · atenuada (otra serie enfocada). |
| `--color-dv-cat-3-dim` | cf-teal-dim · #CFEBEB | cf-teal-dim-d · #324B50 | Serie 3 · atenuada (otra serie enfocada). |
| `--color-dv-cat-4-dim` | cf-coral-dim · #FFDBD4 | cf-coral-dim-d · #5A3E3E | Serie 4 · atenuada (otra serie enfocada). |
| `--color-dv-cat-5-dim` | cf-blue-dim · #CDDFFB | cf-blue-dim-d · #32415C | Serie 5 · atenuada (otra serie enfocada). |
| `--color-dv-cat-6-dim` | cf-olive-dim · #E1EACE | cf-olive-dim-d · #424B39 | Serie 6 · atenuada (otra serie enfocada). |
| `--color-dv-cat-7-dim` | cf-pink-dim · #F8DFEE | cf-pink-dim-d · #544152 | Serie 7 · atenuada (otra serie enfocada). |
| `--color-dv-cat-8-dim` | cf-mint-dim · #CEE9DF | cf-mint-dim-d · #314946 | Serie 8 · atenuada (otra serie enfocada). |
| `--color-dv-label-on-fill` | neutral-950 · #15171D | neutral-1000 · #0D0E12 | Etiqueta de valor dentro de una barra/sector de Colorfield. |
| `--color-dv-selected-outline` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Contorno 2px de serie/marca seleccionada. |
| `--color-dv-disabled` | neutral-200 · #CBCDD5 | neutral-700 · #42444F | Serie deshabilitada / oculta en leyenda. |
| `--color-dv-other` | neutral-400 · #838791 | neutral-500 · #676B76 | Categoría “Otros” y series agregadas. |
| `--color-dv-reference` | neutral-950 · #15171D | neutral-100 · #E5E7EA | Línea de referencia (precio objetivo, presupuesto): 1.5px discontinua. |
| `--color-dv-target-band` | neutral-100 · #E5E7EA | neutral-850 · #25262D | Banda de rango objetivo. |
| `--color-dv-axis` | neutral-400 · #838791 | neutral-500 · #676B76 | Línea de eje. |
| `--color-dv-grid` | neutral-100 · #E5E7EA | neutral-800 · #303038 | Cuadrícula. |
| `--color-dv-tick-label` | neutral-600 · #5C606A | neutral-300 · #BEC0CB | Etiquetas de eje. |
| `--color-dv-legend-text` | neutral-950 · #15171D | neutral-25 · #F6F6F7 | Texto de leyenda. |
| `--color-dv-tooltip-bg` | neutral-950 · #15171D | neutral-800 · #303038 | Fondo de tooltip. |
| `--color-dv-tooltip-text` | neutral-0 · #FFFFFF | neutral-25 · #F6F6F7 | Texto de tooltip. |
| `--color-dv-tooltip-border` | neutral-950 · #15171D | neutral-700 · #42444F | Borde de tooltip. |
| `--color-dv-missing-fill` | neutral-25 · #F6F6F7 | neutral-950 · #15171D | Valor ausente: relleno. |
| `--color-dv-missing-hatch` | neutral-300 · #BEC0CB | neutral-700 · #42444F | Valor ausente: trama. |
| `--color-dv-noncomparable-fill` | neutral-100 · #E5E7EA | neutral-850 · #25262D | No comparable: relleno. |
| `--color-dv-noncomparable-hatch` | neutral-400 · #838791 | neutral-600 · #5C606A | No comparable: trama (más densa que ausente). |
| `--color-dv-seq-violet-1` | cf-violet-100 · #EDEAFF | cf-violet-900 · #3B2E64 | Secuencial Violeta 1/7 (1 = menor valor). |
| `--color-dv-seq-violet-2` | cf-violet-200 · #DBD5FF | cf-violet-800 · #52408A | Secuencial Violeta 2/7 (1 = menor valor). |
| `--color-dv-seq-violet-3` | cf-violet-300 · #C6BBFF | cf-violet-700 · #6B55B0 | Secuencial Violeta 3/7 (1 = menor valor). |
| `--color-dv-seq-violet-4` | cf-violet-400 · #B09DFB | cf-violet-600 · #826AD1 | Secuencial Violeta 4/7 (1 = menor valor). |
| `--color-dv-seq-violet-5` | cf-violet-500 · #9A83EC | cf-violet-500 · #9A83EC | Secuencial Violeta 5/7 (1 = menor valor). |
| `--color-dv-seq-violet-6` | cf-violet-600 · #826AD1 | cf-violet-400 · #B09DFB | Secuencial Violeta 6/7 (1 = menor valor). |
| `--color-dv-seq-violet-7` | cf-violet-700 · #6B55B0 | cf-violet-300 · #C6BBFF | Secuencial Violeta 7/7 (1 = menor valor). |
| `--color-dv-seq-blue-1` | cf-blue-100 · #E2EEFF | cf-blue-900 · #1D3962 | Secuencial Azul 1/7 (1 = menor valor). |
| `--color-dv-seq-blue-2` | cf-blue-200 · #C5DDFF | cf-blue-800 · #284F87 | Secuencial Azul 2/7 (1 = menor valor). |
| `--color-dv-seq-blue-3` | cf-blue-300 · #A2C8FF | cf-blue-700 · #3767AC | Secuencial Azul 3/7 (1 = menor valor). |
| `--color-dv-seq-blue-4` | cf-blue-400 · #7FB0F7 | cf-blue-600 · #497FCC | Secuencial Azul 4/7 (1 = menor valor). |
| `--color-dv-seq-blue-5` | cf-blue-500 · #649BEB | cf-blue-500 · #649BEB | Secuencial Azul 5/7 (1 = menor valor). |
| `--color-dv-seq-blue-6` | cf-blue-600 · #497FCC | cf-blue-400 · #7FB0F7 | Secuencial Azul 6/7 (1 = menor valor). |
| `--color-dv-seq-blue-7` | cf-blue-700 · #3767AC | cf-blue-300 · #A2C8FF | Secuencial Azul 7/7 (1 = menor valor). |
| `--color-dv-div-1` | cf-blue-800 · #284F87 | cf-blue-300 · #A2C8FF | Divergente 1/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-2` | cf-blue-600 · #497FCC | cf-blue-500 · #649BEB | Divergente 2/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-3` | cf-blue-400 · #7FB0F7 | cf-blue-700 · #3767AC | Divergente 3/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-4` | cf-blue-200 · #C5DDFF | cf-blue-900 · #1D3962 | Divergente 4/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-5` | neutral-100 · #E5E7EA | neutral-700 · #42444F | Divergente · punto medio (= referencia). |
| `--color-dv-div-6` | cf-coral-200 · #FFCDC5 | cf-coral-900 · #5C2720 | Divergente 6/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-7` | cf-coral-400 · #F58B7B | cf-coral-700 · #A1483C | Divergente 7/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-8` | cf-coral-600 · #C15C4E | cf-coral-500 · #DC7565 | Divergente 8/9 (azul = por debajo, coral = por encima). |
| `--color-dv-div-9` | cf-coral-800 · #7F362C | cf-coral-300 · #FBB0A4 | Divergente 9/9 (azul = por debajo, coral = por encima). |

## 6. Estados funcionales
Cada estado tiene: `text` (texto e icono), `bg-subtle`, `bg`, `border`, `strong` (relleno de máximo énfasis), `strong-hover`, `on-strong`. Combinaciones permitidas: `text` sobre `bg-subtle`, `bg`, `surface` o `canvas`; `on-strong` sobre `strong`/`strong-hover`. Todas ≥4.5:1 (§9).

**Todo estado lleva una señal no cromática:** etiqueta textual siempre; icono o patrón de borde cuando el espacio lo permita.

### Reglas Quoly
| Situación | Tokens | Regla |
|---|---|---|
| Valor propuesto por IA | `data-proposed-*` (AI Review) | Etiqueta “IA · revisar” + borde discontinuo. Hasta que el comprador confirma. |
| Valor confirmado | `data-confirmed-*` | Aspecto de dato normal + marca ✓. No usa verde. |
| Valor editado | `data-edited-mark` | Etiqueta “Editado”; el valor original sigue accesible. |
| Dato ausente | `data-missing-*` | Texto “No indicado” + borde discontinuo. Nunca vacío, nunca 0, nunca error. |
| No comparable | `data-noncomparable-*` | Trama + motivo (unidad, Incoterm, alcance). |
| Cotización parcial | `status-info-*` | “Parcial · n/m líneas”. Nunca error. |
| Advertencia | `status-warning-*` | Pide atención; no afirma que el dato sea incorrecto. |
| Error | `status-error-*` | Solo fallos reales (lectura fallida, envío fallido, validación). |
| Completado | `status-success-*` | Acción del sistema terminada. Nunca designa ganador. |
| Solicitud cerrada | `status-neutral-*` | Distinta de adjudicada. |
| Adjudicada / decisión registrada | `status-neutral-strong` | Neutral fuerte. Ni verde ni marca. |
| Única oferta comparable | `status-neutral-*` | “1 oferta comparable”. Nunca “recomendada”. |
| Marca | `brand` | Identidad y acción principal. **El coral nunca significa error.** |

## 7. Visualización · Colorfield
- **Categórico:** `--color-dv-cat-1…8` en el orden de §2. Usar el número mínimo de series; asignar por significado (la misma entidad mantiene su color en todas las gráficas de una vista; un proveedor conserva su color en toda la comparación).
- **Hasta 4 series:** solo color. **5–8 series:** además etiqueta directa o marcador de forma distinta. **Más de 8:** agrupar en “Otros” (`dv-other`).
- **Pares cercanos** (ΔE mínimo entre visión normal y CVD < 0.05): Violeta–Azul (0.011), Coral–Oliva (0.022), Rosa–Turquesa (0.033), Amarillo–Oliva (0.040), Menta–Turquesa (0.048). No colocarlos adyacentes; si coexisten, exigir etiqueta directa o forma distinta.
- **Light:** relleno `dv-cat-n` + contorno/línea `dv-cat-n-line` (≥3:1). Puntos y líneas finas siempre `-line`.
- **Dark:** `dv-cat-n` y `-line` coinciden (base ≥3:1 sobre #1B1C22).
- **Hover:** `dv-cat-n-hover`. **Selección:** relleno pleno + contorno 2px `dv-selected-outline`; resto de series → `dv-cat-n-dim`. **Deshabilitada/oculta:** `dv-disabled`.
- **Etiquetas dentro de rellenos:** `dv-label-on-fill` (#15171D / #0D0E12) en ambos modos; ≥4.5:1 sobre los 8 colores.
- **Secuencial:** `dv-seq-violet-1…7`, `dv-seq-blue-1…7` (1 = menor). En dark, 1 es el paso más próximo a la superficie y 7 el más luminoso.
- **Divergente:** `dv-div-1…9`, azul (por debajo) ↔ neutro (referencia) ↔ coral (por encima). Uso: desviación frente a precio objetivo o mediana. Evita rojo/verde.
- **Referencia:** `dv-reference` 1.5px discontinua; banda `dv-target-band`.
- **Ejes, cuadrícula, etiquetas:** `dv-axis`, `dv-grid`, `dv-tick-label`, `dv-legend-text`. **Tooltip:** `dv-tooltip-bg/-text/-border`.
- **Ausente:** `dv-missing-fill` + trama `dv-missing-hatch` + texto “Sin dato”. **No comparable:** `dv-noncomparable-*` (trama más densa) + motivo.
- **Colorfield nunca se usa para estados** y los colores de estado nunca se usan como series. Una serie verde no es “éxito”; una serie coral no es marca ni error.

## 8. Reglas de uso
- Componentes consumen solo `--color-*`.
- La marca aparece en: acción principal, foco, indicador de selección, subrayado de enlaces, momentos de identidad. No en texto, no en estados, no en series.
- Un solo relleno de marca por zona de decisión.
- text-muted no se usa sobre surface-elevated (light: 4.30:1); usar text-secondary.
- Controles sobre surface-elevated usan `border-strong-on-elevated`.
- Nunca usar un valor de un modo en el otro.

### Combinaciones prohibidas
| Combinación | Ratio | Alternativa |
|---|---|---|
| Blanco sobre #F34D64 | 3.47 | text-on-brand #15171D |
| Blanco sobre #FF687C | 2.79 | text-on-brand #0D0E12 |
| #F34D64 como texto normal sobre blanco | 3.47 | Texto + subrayado coral |
| text-muted sobre surface-elevated (light) | 4.30 | text-secondary |
| Relleno Colorfield como línea en light | 1.7–2.9 | `dv-cat-n-line` |
| Violeta junto a Azul sin etiqueta | ΔE deuter. 0.011 | Etiqueta directa / forma |
| Error sobre tinte de marca | — | status-error-bg* |
| Verde para proveedor ganador | — | status-neutral-strong |

## 9. Accesibilidad (WCAG 2.2 AA)
Texto normal ≥4.5:1; texto grande ≥3:1; elementos gráficos y límites de control ≥3:1. Foco: anillo 2px + separación 2px (`focus-ring-offset`). El color nunca es la única señal.

### Light — 106 pares, 106 cumplen
| Primer plano | Fondo | Tipo | Ratio |
|---|---|---|---|
| text-primary | canvas | Texto 4.5:1 | 15.84 ✓ |
| text-primary | surface | Texto 4.5:1 | 17.92 ✓ |
| text-primary | surface-elevated | Texto 4.5:1 | 14.46 ✓ |
| text-primary | surface-sunken | Texto 4.5:1 | 16.59 ✓ |
| text-primary | surface-hover | Texto 4.5:1 | 15.84 ✓ |
| text-primary | surface-selected | Texto 4.5:1 | 15.05 ✓ |
| text-secondary | canvas | Texto 4.5:1 | 5.57 ✓ |
| text-secondary | surface | Texto 4.5:1 | 6.29 ✓ |
| text-secondary | surface-elevated | Texto 4.5:1 | 5.08 ✓ |
| text-secondary | surface-sunken | Texto 4.5:1 | 5.83 ✓ |
| text-secondary | surface-hover | Texto 4.5:1 | 5.57 ✓ |
| text-secondary | surface-selected | Texto 4.5:1 | 5.29 ✓ |
| text-muted | canvas | Texto 4.5:1 | 4.71 ✓ |
| text-muted | surface | Texto 4.5:1 | 5.33 ✓ |
| text-muted | surface-sunken | Texto 4.5:1 | 4.93 ✓ |
| text-muted | surface-hover | Texto 4.5:1 | 4.71 ✓ |
| text-inverse | surface-inverse | Texto 4.5:1 | 17.92 ✓ |
| action-primary-fg | action-primary-bg | Texto 4.5:1 | 5.17 ✓ |
| action-primary-fg | action-primary-bg-hover | Texto 4.5:1 | 6.42 ✓ |
| action-primary-fg | action-primary-bg-active | Texto 4.5:1 | 4.63 ✓ |
| action-secondary-fg | action-secondary-bg | Texto 4.5:1 | 17.92 ✓ |
| action-secondary-fg | action-secondary-bg-hover | Texto 4.5:1 | 15.84 ✓ |
| action-secondary-fg | action-secondary-bg-active | Texto 4.5:1 | 14.46 ✓ |
| action-secondary-border | surface | UI 3:1 | 3.60 ✓ |
| action-secondary-border | canvas | UI 3:1 | 3.18 ✓ |
| action-destructive-fg | action-destructive-bg | Texto 4.5:1 | 6.02 ✓ |
| action-destructive-fg | action-destructive-bg-hover | Texto 4.5:1 | 8.70 ✓ |
| link | surface | Texto 4.5:1 | 17.92 ✓ |
| link-decoration | surface | UI 3:1 | 3.47 ✓ |
| link-decoration | canvas | UI 3:1 | 3.07 ✓ |
| border-strong | surface | UI 3:1 | 3.60 ✓ |
| border-strong | canvas | UI 3:1 | 3.18 ✓ |
| border-strong-on-elevated | surface-elevated | UI 3:1 | 4.30 ✓ |
| focus-ring | surface | UI 3:1 | 4.48 ✓ |
| focus-ring | canvas | UI 3:1 | 3.96 ✓ |
| focus-ring | surface-elevated | UI 3:1 | 3.61 ✓ |
| focus-ring | selection-bg | UI 3:1 | 3.76 ✓ |
| selection-indicator | selection-bg | UI 3:1 | 3.76 ✓ |
| selection-text | selection-bg | Texto 4.5:1 | 15.05 ✓ |
| status-success-text | status-success-bg-subtle | Texto 4.5:1 | 4.95 ✓ |
| status-success-text | status-success-bg | Texto 4.5:1 | 4.56 ✓ |
| status-success-text | surface | Texto 4.5:1 | 5.29 ✓ |
| status-success-text | canvas | Texto 4.5:1 | 4.68 ✓ |
| status-success-on-strong | status-success-strong | Texto 4.5:1 | 5.29 ✓ |
| status-success-on-strong | status-success-strong-hover | Texto 4.5:1 | 7.80 ✓ |
| status-warning-text | status-warning-bg-subtle | Texto 4.5:1 | 5.06 ✓ |
| status-warning-text | status-warning-bg | Texto 4.5:1 | 4.64 ✓ |
| status-warning-text | surface | Texto 4.5:1 | 5.46 ✓ |
| status-warning-text | canvas | Texto 4.5:1 | 4.83 ✓ |
| status-warning-on-strong | status-warning-strong | Texto 4.5:1 | 5.46 ✓ |
| status-warning-on-strong | status-warning-strong-hover | Texto 4.5:1 | 8.30 ✓ |
| status-error-text | status-error-bg-subtle | Texto 4.5:1 | 5.58 ✓ |
| status-error-text | status-error-bg | Texto 4.5:1 | 5.07 ✓ |
| status-error-text | surface | Texto 4.5:1 | 6.02 ✓ |
| status-error-text | canvas | Texto 4.5:1 | 5.32 ✓ |
| status-error-on-strong | status-error-strong | Texto 4.5:1 | 6.02 ✓ |
| status-error-on-strong | status-error-strong-hover | Texto 4.5:1 | 8.70 ✓ |
| status-info-text | status-info-bg-subtle | Texto 4.5:1 | 5.27 ✓ |
| status-info-text | status-info-bg | Texto 4.5:1 | 4.84 ✓ |
| status-info-text | surface | Texto 4.5:1 | 5.67 ✓ |
| status-info-text | canvas | Texto 4.5:1 | 5.02 ✓ |
| status-info-on-strong | status-info-strong | Texto 4.5:1 | 5.67 ✓ |
| status-info-on-strong | status-info-strong-hover | Texto 4.5:1 | 8.16 ✓ |
| status-ai-text | status-ai-bg-subtle | Texto 4.5:1 | 6.29 ✓ |
| status-ai-text | status-ai-bg | Texto 4.5:1 | 5.76 ✓ |
| status-ai-text | surface | Texto 4.5:1 | 6.79 ✓ |
| status-ai-text | canvas | Texto 4.5:1 | 6.01 ✓ |
| status-ai-on-strong | status-ai-strong | Texto 4.5:1 | 6.79 ✓ |
| status-ai-on-strong | status-ai-strong-hover | Texto 4.5:1 | 8.63 ✓ |
| status-neutral-text | status-neutral-bg-subtle | Texto 4.5:1 | 5.57 ✓ |
| status-neutral-text | status-neutral-bg | Texto 4.5:1 | 5.08 ✓ |
| status-neutral-text | surface | Texto 4.5:1 | 6.29 ✓ |
| status-neutral-text | canvas | Texto 4.5:1 | 5.57 ✓ |
| status-neutral-on-strong | status-neutral-strong | Texto 4.5:1 | 17.92 ✓ |
| data-proposed-text | data-proposed-bg | Texto 4.5:1 | 6.29 ✓ |
| data-missing-text | data-missing-bg | Texto 4.5:1 | 4.93 ✓ |
| text-primary | data-noncomparable-bg | Texto 4.5:1 | 14.46 ✓ |
| dv-cat-1-line | surface | UI 3:1 | 3.40 ✓ |
| dv-cat-1-line | canvas | UI 3:1 | 3.00 ✓ |
| dv-label-on-fill | dv-cat-1 | Texto 4.5:1 | 5.83 ✓ |
| dv-cat-2-line | surface | UI 3:1 | 3.42 ✓ |
| dv-cat-2-line | canvas | UI 3:1 | 3.02 ✓ |
| dv-label-on-fill | dv-cat-2 | Texto 4.5:1 | 10.50 ✓ |
| dv-cat-3-line | surface | UI 3:1 | 3.41 ✓ |
| dv-cat-3-line | canvas | UI 3:1 | 3.02 ✓ |
| dv-label-on-fill | dv-cat-3 | Texto 4.5:1 | 8.28 ✓ |
| dv-cat-4-line | surface | UI 3:1 | 3.39 ✓ |
| dv-cat-4-line | canvas | UI 3:1 | 3.00 ✓ |
| dv-label-on-fill | dv-cat-4 | Texto 4.5:1 | 7.56 ✓ |
| dv-cat-5-line | surface | UI 3:1 | 3.41 ✓ |
| dv-cat-5-line | canvas | UI 3:1 | 3.02 ✓ |
| dv-label-on-fill | dv-cat-5 | Texto 4.5:1 | 6.34 ✓ |
| dv-cat-6-line | surface | UI 3:1 | 3.40 ✓ |
| dv-cat-6-line | canvas | UI 3:1 | 3.01 ✓ |
| dv-label-on-fill | dv-cat-6 | Texto 4.5:1 | 8.57 ✓ |
| dv-cat-7-line | surface | UI 3:1 | 3.41 ✓ |
| dv-cat-7-line | canvas | UI 3:1 | 3.02 ✓ |
| dv-label-on-fill | dv-cat-7 | Texto 4.5:1 | 8.30 ✓ |
| dv-cat-8-line | surface | UI 3:1 | 3.40 ✓ |
| dv-cat-8-line | canvas | UI 3:1 | 3.01 ✓ |
| dv-label-on-fill | dv-cat-8 | Texto 4.5:1 | 7.58 ✓ |
| dv-tick-label | surface | Texto 4.5:1 | 6.29 ✓ |
| dv-axis | surface | UI 3:1 | 3.60 ✓ |
| dv-reference | surface | UI 3:1 | 17.92 ✓ |
| dv-tooltip-text | dv-tooltip-bg | Texto 4.5:1 | 17.92 ✓ |
| dv-selected-outline | surface | UI 3:1 | 17.92 ✓ |

### Dark — 106 pares, 106 cumplen
| Primer plano | Fondo | Tipo | Ratio |
|---|---|---|---|
| text-primary | canvas | Texto 4.5:1 | 17.86 ✓ |
| text-primary | surface | Texto 4.5:1 | 15.73 ✓ |
| text-primary | surface-elevated | Texto 4.5:1 | 12.11 ✓ |
| text-primary | surface-sunken | Texto 4.5:1 | 16.59 ✓ |
| text-primary | surface-hover | Texto 4.5:1 | 13.95 ✓ |
| text-primary | surface-selected | Texto 4.5:1 | 12.93 ✓ |
| text-secondary | canvas | Texto 4.5:1 | 10.65 ✓ |
| text-secondary | surface | Texto 4.5:1 | 9.38 ✓ |
| text-secondary | surface-elevated | Texto 4.5:1 | 7.22 ✓ |
| text-secondary | surface-sunken | Texto 4.5:1 | 9.89 ✓ |
| text-secondary | surface-hover | Texto 4.5:1 | 8.32 ✓ |
| text-secondary | surface-selected | Texto 4.5:1 | 7.71 ✓ |
| text-muted | canvas | Texto 4.5:1 | 5.90 ✓ |
| text-muted | surface | Texto 4.5:1 | 5.20 ✓ |
| text-muted | surface-sunken | Texto 4.5:1 | 5.48 ✓ |
| text-muted | surface-hover | Texto 4.5:1 | 4.61 ✓ |
| text-inverse | surface-inverse | Texto 4.5:1 | 16.59 ✓ |
| action-primary-fg | action-primary-bg | Texto 4.5:1 | 6.91 ✓ |
| action-primary-fg | action-primary-bg-hover | Texto 4.5:1 | 10.81 ✓ |
| action-primary-fg | action-primary-bg-active | Texto 4.5:1 | 5.56 ✓ |
| action-secondary-fg | action-secondary-bg | Texto 4.5:1 | 12.11 ✓ |
| action-secondary-fg | action-secondary-bg-hover | Texto 4.5:1 | 8.95 ✓ |
| action-secondary-fg | action-secondary-bg-active | Texto 4.5:1 | 13.95 ✓ |
| action-secondary-border | surface | UI 3:1 | 3.19 ✓ |
| action-secondary-border | canvas | UI 3:1 | 3.62 ✓ |
| action-destructive-fg | action-destructive-bg | Texto 4.5:1 | 8.52 ✓ |
| action-destructive-fg | action-destructive-bg-hover | Texto 4.5:1 | 10.79 ✓ |
| link | surface | Texto 4.5:1 | 15.73 ✓ |
| link-decoration | surface | UI 3:1 | 6.09 ✓ |
| link-decoration | canvas | UI 3:1 | 6.91 ✓ |
| border-strong | surface | UI 3:1 | 3.19 ✓ |
| border-strong | canvas | UI 3:1 | 3.62 ✓ |
| border-strong-on-elevated | surface-elevated | UI 3:1 | 4.00 ✓ |
| focus-ring | surface | UI 3:1 | 6.09 ✓ |
| focus-ring | canvas | UI 3:1 | 6.91 ✓ |
| focus-ring | surface-elevated | UI 3:1 | 4.69 ✓ |
| focus-ring | selection-bg | UI 3:1 | 5.00 ✓ |
| selection-indicator | selection-bg | UI 3:1 | 5.00 ✓ |
| selection-text | selection-bg | Texto 4.5:1 | 12.93 ✓ |
| status-success-text | status-success-bg-subtle | Texto 4.5:1 | 8.30 ✓ |
| status-success-text | status-success-bg | Texto 4.5:1 | 7.20 ✓ |
| status-success-text | surface | Texto 4.5:1 | 9.55 ✓ |
| status-success-text | canvas | Texto 4.5:1 | 10.84 ✓ |
| status-success-on-strong | status-success-strong | Texto 4.5:1 | 10.84 ✓ |
| status-success-on-strong | status-success-strong-hover | Texto 4.5:1 | 14.15 ✓ |
| status-warning-text | status-warning-bg-subtle | Texto 4.5:1 | 8.96 ✓ |
| status-warning-text | status-warning-bg | Texto 4.5:1 | 7.77 ✓ |
| status-warning-text | surface | Texto 4.5:1 | 10.25 ✓ |
| status-warning-text | canvas | Texto 4.5:1 | 11.64 ✓ |
| status-warning-on-strong | status-warning-strong | Texto 4.5:1 | 11.64 ✓ |
| status-warning-on-strong | status-warning-strong-hover | Texto 4.5:1 | 13.76 ✓ |
| status-error-text | status-error-bg-subtle | Texto 4.5:1 | 6.63 ✓ |
| status-error-text | status-error-bg | Texto 4.5:1 | 5.84 ✓ |
| status-error-text | surface | Texto 4.5:1 | 7.51 ✓ |
| status-error-text | canvas | Texto 4.5:1 | 8.52 ✓ |
| status-error-on-strong | status-error-strong | Texto 4.5:1 | 8.52 ✓ |
| status-error-on-strong | status-error-strong-hover | Texto 4.5:1 | 10.79 ✓ |
| status-info-text | status-info-bg-subtle | Texto 4.5:1 | 7.21 ✓ |
| status-info-text | status-info-bg | Texto 4.5:1 | 6.24 ✓ |
| status-info-text | surface | Texto 4.5:1 | 8.20 ✓ |
| status-info-text | canvas | Texto 4.5:1 | 9.31 ✓ |
| status-info-on-strong | status-info-strong | Texto 4.5:1 | 9.31 ✓ |
| status-info-on-strong | status-info-strong-hover | Texto 4.5:1 | 11.23 ✓ |
| status-ai-text | status-ai-bg-subtle | Texto 4.5:1 | 6.39 ✓ |
| status-ai-text | status-ai-bg | Texto 4.5:1 | 5.69 ✓ |
| status-ai-text | surface | Texto 4.5:1 | 7.13 ✓ |
| status-ai-text | canvas | Texto 4.5:1 | 8.09 ✓ |
| status-ai-on-strong | status-ai-strong | Texto 4.5:1 | 8.09 ✓ |
| status-ai-on-strong | status-ai-strong-hover | Texto 4.5:1 | 10.95 ✓ |
| status-neutral-text | status-neutral-bg-subtle | Texto 4.5:1 | 8.32 ✓ |
| status-neutral-text | status-neutral-bg | Texto 4.5:1 | 7.22 ✓ |
| status-neutral-text | surface | Texto 4.5:1 | 9.38 ✓ |
| status-neutral-text | canvas | Texto 4.5:1 | 10.65 ✓ |
| status-neutral-on-strong | status-neutral-strong | Texto 4.5:1 | 16.59 ✓ |
| data-proposed-text | data-proposed-bg | Texto 4.5:1 | 6.39 ✓ |
| data-missing-text | data-missing-bg | Texto 4.5:1 | 5.48 ✓ |
| text-primary | data-noncomparable-bg | Texto 4.5:1 | 13.95 ✓ |
| dv-cat-1-line | surface | UI 3:1 | 5.53 ✓ |
| dv-cat-1-line | canvas | UI 3:1 | 6.28 ✓ |
| dv-label-on-fill | dv-cat-1 | Texto 4.5:1 | 6.28 ✓ |
| dv-cat-2-line | surface | UI 3:1 | 9.96 ✓ |
| dv-cat-2-line | canvas | UI 3:1 | 11.31 ✓ |
| dv-label-on-fill | dv-cat-2 | Texto 4.5:1 | 11.31 ✓ |
| dv-cat-3-line | surface | UI 3:1 | 7.86 ✓ |
| dv-cat-3-line | canvas | UI 3:1 | 8.92 ✓ |
| dv-label-on-fill | dv-cat-3 | Texto 4.5:1 | 8.92 ✓ |
| dv-cat-4-line | surface | UI 3:1 | 7.17 ✓ |
| dv-cat-4-line | canvas | UI 3:1 | 8.14 ✓ |
| dv-label-on-fill | dv-cat-4 | Texto 4.5:1 | 8.14 ✓ |
| dv-cat-5-line | surface | UI 3:1 | 6.01 ✓ |
| dv-cat-5-line | canvas | UI 3:1 | 6.82 ✓ |
| dv-label-on-fill | dv-cat-5 | Texto 4.5:1 | 6.82 ✓ |
| dv-cat-6-line | surface | UI 3:1 | 8.13 ✓ |
| dv-cat-6-line | canvas | UI 3:1 | 9.22 ✓ |
| dv-label-on-fill | dv-cat-6 | Texto 4.5:1 | 9.22 ✓ |
| dv-cat-7-line | surface | UI 3:1 | 7.87 ✓ |
| dv-cat-7-line | canvas | UI 3:1 | 8.94 ✓ |
| dv-label-on-fill | dv-cat-7 | Texto 4.5:1 | 8.94 ✓ |
| dv-cat-8-line | surface | UI 3:1 | 7.19 ✓ |
| dv-cat-8-line | canvas | UI 3:1 | 8.16 ✓ |
| dv-label-on-fill | dv-cat-8 | Texto 4.5:1 | 8.16 ✓ |
| dv-tick-label | surface | Texto 4.5:1 | 9.38 ✓ |
| dv-axis | surface | UI 3:1 | 3.19 ✓ |
| dv-reference | surface | UI 3:1 | 13.72 ✓ |
| dv-tooltip-text | dv-tooltip-bg | Texto 4.5:1 | 12.11 ✓ |
| dv-selected-outline | surface | UI 3:1 | 15.73 ✓ |

## 10. Pendiente de validación visual
- **Marca vs error:** #F34D64/#FF687C y #B72F3E/#FF8997 comparten matiz. Mitigado por uso (la marca nunca es texto ni estado). Validar en dark, donde brand-400 y error-400 son próximos.
- **Acción principal con texto oscuro** sobre coral: decisión forzada por contraste; confirmar que se percibe como identidad deseada.
- **Superficie elevada light más oscura que surface:** confirmar lectura de jerarquía en componentes (fase posterior).
- **Neutral 500 y 600** son próximos (#676B76 / #5C606A): ambos necesarios por contraste; validar diferencia texto atenuado/secundario.
- **Colorfield Violeta–Azul** casi indistinguibles con deuteranopía.
- **brand-950 (#43222C)** tiene menos croma que brand-900 por ser valor aprobado de selección dark.

## 11. Obsoleto
Eliminados de `tokens/colors.css`: Graphite `#262B2D`, Ice Blue `#7FB8C9`, sus tintes, todo el neutral anterior (`--ink`, `--text-2`, `--muted`, `--canvas`, `--soft`, `--border*`), toda la paleta dark `--d-*`, y los estados `--success/--warning/--error/--info` y `--d-*`. Tarjetas eliminadas: colors-primary, colors-editorial, colors-neutrals-light/dark, colors-feedback-light/dark.

**Alias de compatibilidad (obsoletos):** `--bg-*`, `--fg-*`, `--line*`, `--accent*`, `--action-primary-*`, `--focus-ring`, `--fb-*`, `--graphite`, `--ice`, `--soft`, `--ink`, `--muted` siguen definidos apuntando a tokens nuevos para que los componentes y tarjetas existentes no se rompan. Se eliminarán al migrar componentes. Textos de `.prompt.md`, logos (`logo.svg` Graphite, `logo-ice.svg`) y tarjetas de otras fases aún mencionan Graphite/Ice; se actualizan en sus fases.
