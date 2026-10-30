# Quoly 2.0 · Sistema tipográfico
**Familias oficiales: Outfit (display) + Inter (texto).** Fase 02. Sustituye por completo a Geist / Geist Mono (§12). Colores: tokens de la Fase 01 sin cambios.

Valores: `tokens/typography.css` · utilidades: `tokens/base.css` (`.q-type-*`, `.q-num`, `.q-id`, `.q-affix`) · catálogo: grupo **Type** (`guidelines/type-*.html`).

## 1. Familias
| Familia | Token | Archivo | Uso |
|---|---|---|---|
| Outfit | `--font-display` | `fonts/Outfit-VariableFont_wght.ttf` (wght 100–900) | Display, headings, titles, cifras destacadas (Figure). |
| Inter | `--font-text` | `fonts/Inter-VariableFont_opsz_wght.ttf` + Italic (opsz 14–32, wght 100–900) | Todo lo demás: texto, controles, navegación, tablas, datos, IDs, procedencia. |

- Pesos del sistema: **400, 500, 600** (`--font-weight-regular/medium/semibold`). **700 no existe en el sistema.**
- Outfit no se usa por debajo de 16px. Inter no se usa por encima de 16px salvo body-lg/data-lg.
- `font-optical-sizing:auto` activa el eje opsz de Inter (ajuste óptico automático por tamaño).
- No hay tercera familia: la monoespaciada desaparece del sistema.

## 2. Escala y roles
Tamaños en rem (base 16px). Roles con `clamp()` escalan entre el mínimo y el valor de referencia (§9).

| Rol | Familia | px | rem / fluido | Peso | LH | Tracking | Color | Uso |
|---|---|---:|---|---:|---:|---|---|---|
| Display XL `--type-display-xl` | Outfit | 60 | `clamp(2.5rem, 1.75rem + 2.5vw, 3.75rem)` | 400 | 1.08 | -0.025em | text-primary | Marketing y editorial: titular principal de página. Nunca en el workspace. |
| Display LG `--type-display-lg` | Outfit | 48 | `clamp(2.25rem, 1.8rem + 1.5vw, 3rem)` | 400 | 1.12 | -0.022em | text-primary | Marketing: titulares de sección. |
| Display MD `--type-display-md` | Outfit | 40 | `clamp(2rem, 1.7rem + 1vw, 2.5rem)` | 400 | 1.15 | -0.02em | text-primary | Marketing; en producto solo pantallas vacías de bienvenida u onboarding. |
| Heading XL `--type-heading-xl` | Outfit | 32 | `clamp(1.75rem, 1.6rem + 0.5vw, 2rem)` | 500 | 1.2 | -0.016em | text-primary | Título de página en vistas amplias (resumen de RFQ, comparación). |
| Heading LG `--type-heading-lg` | Outfit | 28 | `clamp(1.5rem, 1.4rem + 0.35vw, 1.75rem)` | 500 | 1.2 | -0.014em | text-primary | Título de página por defecto del workspace. |
| Heading MD `--type-heading-md` | Outfit | 24 | `clamp(1.375rem, 1.33rem + 0.15vw, 1.5rem)` | 500 | 1.25 | -0.012em | text-primary | Título de página denso (tablas extensas) y encabezado de sección principal. |
| Heading SM `--type-heading-sm` | Outfit | 20 | 1.25rem | 500 | 1.3 | -0.008em | text-primary | Encabezado de sección. |
| Title LG `--type-title-lg` | Outfit | 18 | 1.125rem | 500 | 1.35 | -0.005em | text-primary | Encabezado de subsección, título de panel o de diálogo. |
| Title SM `--type-title-sm` | Outfit | 16 | 1rem | 500 | 1.4 | -0.002em | text-primary | Título de grupo o registro cuando actúa como encabezado (h3–h4). |
| Body LG `--type-body-lg` | Inter | 16 | 1rem | 400 | 1.6 | 0 | text-primary | Lectura prolongada: explicaciones, mensajes de proveedor en vista completa, ayudas extensas. |
| Body MD `--type-body-md` | Inter | 14 | 0.875rem | 400 | 1.5 | 0 | text-primary | Tamaño por defecto del contenido operativo. |
| Body SM `--type-body-sm` | Inter | 13 | 0.8125rem | 400 | 1.5 | 0 | text-secondary | Texto de apoyo, descripciones breves, información secundaria de un registro. |
| Label LG `--type-label-lg` | Inter | 14 | 0.875rem | 500 | 1.4 | 0 | text-primary | Navegación, acciones (botones), etiquetas de formulario en formularios amplios. |
| Label MD `--type-label-md` | Inter | 13 | 0.8125rem | 500 | 1.4 | 0 | text-primary | Etiquetas de formulario, acciones compactas, encabezados de columna, pestañas. |
| Label SM `--type-label-sm` | Inter | 12 | 0.75rem | 500 | 1.4 | 0.005em | text-secondary | Etiquetas auxiliares: badges, chips, contadores. No esencial. |
| Caption `--type-caption` | Inter | 12 | 0.75rem | 400 | 1.45 | 0.005em | text-secondary | Metadatos no esenciales: marcas de tiempo, notas al pie, procedencia. |
| Micro `--type-micro` | Inter | 11 | 0.6875rem | 500 | 1.4 | 0.01em | text-secondary | Solo atajos de teclado, indicadores de versión, contadores redundantes. Nunca información comercial, errores, avisos ni instrucciones. |
| Figure XL `--type-figure-xl` | Outfit | 40 | `clamp(2rem, 1.7rem + 1vw, 2.5rem)` | 400 | 1.1 | -0.02em | text-primary | Cifra protagonista (importe adjudicado, ahorro total). Una por vista. |
| Figure LG `--type-figure-lg` | Outfit | 32 | `clamp(1.75rem, 1.6rem + 0.5vw, 2rem)` | 400 | 1.15 | -0.016em | text-primary | KPI destacado. |
| Figure MD `--type-figure-md` | Outfit | 24 | 1.5rem | 500 | 1.2 | -0.01em | text-primary | KPI secundario, total en resumen de comparación. |
| Figure SM `--type-figure-sm` | Outfit | 20 | 1.25rem | 500 | 1.25 | -0.006em | text-primary | Cifra destacada en cabecera de columna de comparación. |
| Data LG `--type-data-lg` | Inter | 16 | 1rem | 500 | 1.4 | 0 | text-primary | Valor principal de una fila de comparación (precio unitario, total). |
| Data MD `--type-data-md` | Inter | 14 | 0.875rem | 400 | 1.4 | 0 | text-primary | Valor en tabla (cantidades, precios, fechas, plazos). |
| Data MD Strong `--type-data-md-strong` | Inter | 14 | 0.875rem | 500 | 1.4 | 0 | text-primary | Valor destacado dentro de tabla (mejor precio por línea, total de fila). |
| Data SM `--type-data-sm` | Inter | 13 | 0.8125rem | 400 | 1.4 | 0 | text-secondary | Valor secundario bajo el principal (precio por unidad base, conversión de moneda). |
| ID MD `--type-id-md` | Inter | 14 | 0.875rem | 500 | 1.4 | 0.01em | text-primary | Identificador como identidad principal del registro (RFQ-2026-0142). |
| ID SM `--type-id-sm` | Inter | 13 | 0.8125rem | 500 | 1.4 | 0.01em | text-secondary | Identificador secundario (referencia de proveedor, nº de pieza, nº de documento). |
| Evidence `--type-evidence` | Inter Italic | 14 | 0.875rem | 400 | 1.6 | 0 | text-primary | Fragmento literal usado como evidencia: cursiva + comillas + fuente. |
| Original `--type-original` | Inter | 14 | 0.875rem | 400 | 1.6 | 0 | text-primary | Mensaje original del proveedor: verbatim, saltos de línea preservados. |

Cada rol expone `--type-<rol>` (shorthand `font`) y `-family`, `-size`, `-weight`, `-line-height`, `-tracking`. La clase `.q-type-<rol>` aplica shorthand + tracking + rasgos OpenType.

**Roles añadidos a la escala base** (decisión documentada): Label LG (14/500: navegación y acciones a 14px, que la escala base no cubría), Figure XL–SM (Outfit tabular para cifras), Data LG/MD/MD Strong/SM (Inter tabular para valores), ID MD/SM (identificadores), Evidence y Original (procedencia).

## 3. Jerarquía
| Nivel | Rol | Regla |
|---|---|---|
| Título de página | heading-lg (28) por defecto · heading-xl (32) en vistas amplias de resumen · heading-md (24) en vistas densas de tabla | Uno por vista, h1. |
| Encabezado de sección | heading-md (24) principal · heading-sm (20) · title-lg (18) subsección | h2–h3. |
| Grupo / registro como encabezado | title-sm (Outfit 16/500) | Cuando es h3–h4 semántico y visual. |
| Grupo / registro en tabla, lista o control | label-lg (Inter 14/500) · label-md (13/500) compacto | Nunca Outfit dentro de filas. |
| Cuerpo | body-md (14) por defecto · body-lg (16) para lectura prolongada | |
| Etiqueta de formulario | label-md (13/500) · label-lg (14/500) en formularios amplios | |
| Datos secundarios | body-sm / data-sm (13) · caption (12) solo si no es esencial | |
| Navegación | label-lg (14/500) principal · label-md (13/500) secundaria y pestañas | |
| Acciones | label-lg (14/500) · label-md (13/500) en compacto | Nunca semibold 600 en botones. |
| Identificadores | id-md / id-sm | §5. |
| Valores económicos | data-* en tablas · figure-* destacados | §4. |

- Display XL–MD: solo marketing/editorial; en producto únicamente estados vacíos de bienvenida/onboarding.
- **Semibold 600** se reserva para énfasis puntual dentro de texto Inter (palabra clave en body) y nunca en titulares Outfit por defecto. Titulares: Outfit 400 (display) y 500 (heading/title).
- Distancia mínima entre niveles adyacentes: un paso de escala y, si comparten tamaño, cambio de familia o peso.

## 4. Números
- **Tabulares siempre** en tablas, comparaciones, totales, fechas y plazos: `--font-features-numeric` (`tnum`). Outfit también tiene `tnum`: Figure usa `--font-features-figure`.
- **Alineación:** importes, cantidades y porcentajes comparables alineados a la derecha, con el mismo número de decimales dentro de una columna (según la precisión del dato, §Precisión). Fechas y textos a la izquierda.
- **Jerarquía valor · moneda · unidad:**
  - Tabla: valor `data-md-strong` (14/500, text-primary) · moneda `data-md` 14/400 text-secondary (`.q-affix`) · unidad `data-sm` 13/400 text-secondary. Moneda y valor al mismo tamaño para compartir línea base; se diferencian por peso y color.
  - Cifra destacada: valor `figure-*` (Outfit) · moneda `label-lg` (Inter 14/500) text-secondary, alineada a la línea base.
  - Moneda como **código ISO 4217** (EUR, USD) en comparaciones multimoneda; símbolo solo en texto corrido de una sola moneda.
- **Localización:** siempre `Intl.NumberFormat` / `Intl.DateTimeFormat` con el locale del usuario (`es-ES`, `en-US`, …). Nunca separadores compuestos a mano. Posición de moneda y espacio (`12,48 EUR` / `EUR 12.48`) la define el formateador (`currencyDisplay:"code"`).
- **Agrupación de miles:** la decide Intl. En es-ES (CLDR, minimumGroupingDigits 2) los números de 4 cifras no se agrupan (`2500`, `5000`) y desde 5 cifras sí (`12.500`, `31.200,00`). En en-US siempre (`2,500`). No se fuerza manualmente; los ejemplos del sistema siguen esta regla.
- **Precisión:** se muestra la precisión recibida del proveedor (p. ej. 4 decimales en precios unitarios bajos). No se redondea por estética. Totales calculados: precisión de la moneda (`minimumFractionDigits` de Intl).
- **Porcentajes:** 1 decimal por defecto en comparaciones; el signo forma parte del formateador.
- **Lead time:** número tabular + unidad explícita (“21 días naturales” / “21 calendar days”); nunca abreviaturas ambiguas (“3s”).
- **MOQ y escalones:** `≥ 5000 ud.` — operador y unidad en text-secondary.
- **Fechas:** formato corto localizado (`28 nov 2026` / `Nov 28, 2026`); en tablas densas numérico localizado (`28/11/2026` / `11/28/2026`) con cabecera que indique el formato.

## 5. Identificadores
- Inter 500 con `--font-features-id`: `tnum` + `ss02` (desambiguación: I/l/1, O/0 con cero barrado) + `case` (guiones a altura de mayúsculas). Tracking +0.01em.
- id-md (14) cuando el ID es la identidad del registro; id-sm (13, text-secondary) como referencia secundaria; `.q-id` en línea dentro de texto.
- Nunca se truncan. Nunca en mayúsculas forzadas si el original no lo está: se respetan tal cual llegan.

## 6. Tracking
| Grupo | Valor |
|---|---|
| Display | −0.025 / −0.022 / −0.020em |
| Heading | −0.016 / −0.014 / −0.012 / −0.008em |
| Title | −0.005 / −0.002em |
| Figure | −0.020 / −0.016 / −0.010 / −0.006em |
| Body, Label MD/LG, Data | 0 (Inter ajusta con opsz) |
| Label SM, Caption | +0.005em |
| Micro | +0.01em |
| ID | +0.01em |
| Mayúsculas (excepcional: siglas, Incoterms en listas) | +0.04em; nunca más |

Tracking negativo solo en Outfit ≥16px. Inter nunca negativo.

## 7. Tablas y datos densos
| Elemento | Comfortable | Compact (`data-density="compact"`) |
|---|---|---|
| Encabezado de columna | label-md 13/500 · text-secondary · sentence case | 12/500 |
| Identidad del registro | label-lg 14/500 (id-md si es código) | 13/500 |
| Información secundaria | body-sm 13/400 · text-secondary | 12/400 |
| Precio / importe | data-md-strong 14/500 · derecha | 13/500 |
| Moneda | data-md 14/400 · text-secondary | 13/400 |
| Unidad | data-sm 13/400 · text-secondary | 12/400 |
| Cantidad, MOQ, fecha, lead time | data-md 14/400 | 13/400 |
| Estado | label-sm 12/500 + texto siempre | 12/500 |
| Alerta en celda | body-sm 13/500 | 13/500 |
| Referencia | id-sm 13/500 | 12/500 |
| Acción en fila | label-md 13/500 | 13/500 |
| Total de columna | data-lg 16/500 | 14/500 |

Tokens: `--type-table-header`, `-cell`, `-cell-strong`, `-secondary`, `-id`. La densidad se gana con interlineado (1.4 → 1.35) y espaciado, no bajando de 13px en valores comerciales. Encabezados de columna nunca en mayúsculas.

## 8. Procedencia del texto
| Nivel | Tipografía | Señal no cromática |
|---|---|---|
| Mensaje original del proveedor | original · Inter 14/1.6 · `white-space:pre-line` · verbatim | Caption de origen (canal, fecha) encima o debajo. |
| Resumen IA | body-md 14/1.5 regular | Etiqueta textual “Resumen IA · propuesto” en label-sm antes del texto. Nunca Outfit, nunca mayor que el cuerpo, nunca cursiva. |
| Dato estructurado | label-md + data-md-strong | Etiqueta “IA · revisar” hasta confirmación (Fase 01: data-proposed-*). |
| Fragmento de evidencia | evidence · Inter Italic 14/1.6 | Cursiva + comillas tipográficas del idioma («» es / “” en) + caption con documento y página. |
| Corrección del comprador | data-md-strong (nuevo) + data-md tachado (anterior) | Etiqueta “Editado por <nombre> · <fecha>” en label-sm. |

La cursiva queda reservada a citas literales: no se usa para énfasis.

## 9. Responsive y accesibilidad
- **Unidades rem** en todos los tamaños: respetan el tamaño de texto del navegador y el zoom (WCAG 1.4.4). Las fórmulas `clamp(min rem, a rem + b vw, max rem)` tienen mínimo y máximo en rem.
- **Escalado fluido** solo en Display, Heading XL–MD y Figure XL–LG. Por ejemplo Heading LG: 24px a 360px de ancho → 28px desde ~1280px. Heading SM y menores son fijos.
- **Mínimos:** 12px para cualquier texto visible del producto; 11px (Micro) solo no esencial; 13px para valores comerciales; 14px para instrucciones, errores y avisos.
- **Interlineado:** ≥1.5 en texto de párrafo (body, original, evidence); 1.4 en etiquetas y datos; títulos 1.08–1.4. Compatible con WCAG 1.4.12 (los contenedores no fijan altura, se admite 1.5 de interlineado y espaciado ampliado sin pérdida).
- **Longitud de línea:** `--measure-prose` 68ch (lectura), `--measure-narrow` 48ch (ayudas, validaciones), `--measure-wide` 84ch (máximo).
- **Reflow (1.4.10):** a 320px CSS no hay scroll horizontal salvo tablas de datos; los títulos ajustan en varias líneas (`text-wrap:balance`), nunca se truncan.
- **Truncamiento:** solo nombres (proveedor, archivo) con elipsis final o central (archivos conservan extensión) y texto completo accesible (title/tooltip + nombre accesible). Nunca se truncan importes, monedas, unidades, IDs, fechas, estados ni etiquetas de formulario.
- **ES/EN:** el español es ~20–30 % más largo; los anchos se dimensionan con texto en español. `lang` correcto en cada documento para `hyphens:auto` en párrafos largos (nunca en etiquetas, cifras o IDs). Sin mayúsculas forzadas en etiquetas largas.
- **Información crítica** (errores, avisos, totales, decisiones) nunca en Micro ni Caption.

## 10. Coherencia con color (Fase 01)
- Texto en roles: text-primary (títulos, cuerpo, datos), text-secondary (etiquetas de columna, metadatos, afijos), text-muted solo no esencial.
- **Conflicto documentado:** text-muted sobre surface-elevated en light da 4.30:1 (falla 4.5:1). Caption y Micro (12/11px) no se pueden usar con text-muted sobre surface-elevated; usar text-secondary. Ningún color se ha modificado.
- Los tamaños de 12px y 11px no califican como “texto grande”: todos sus pares exigen 4.5:1.
- La marca no se usa como color de texto (Fase 01) — tampoco en titulares Outfit.

## 11. Alias y utilidades
- `.q-type-<rol>` para cada rol. `.q-num` (tabulares), `.q-id` (identificador en línea), `.q-affix` (moneda/unidad secundaria).
- `.q-root` / `[data-theme]` aplican body-md por defecto.

## 12. Obsoleto
- **Geist y Geist Mono:** retiradas; archivos eliminados de `fonts/` y `@font-face` sustituidos.
- **Escala anterior** (72/52/40/26/19/16/14/13/12px en px), titulares Geist 500 a 1.04, datos en monoespaciada (`--font-mono`, `--text-data`), etiquetas en mayúsculas +0.06em, body 16px por defecto.
- **Alias de compatibilidad (obsoletos):** `--font-sans` y `--font-mono` → `--font-text`; `--fw-*` → `--font-weight-*`; `--fs-*`, `--lh-*`, `--tracking-*`, `--text-*` → roles más cercanos; `.q-label`, `.q-mono`. Los componentes actuales tienen tamaños literales en px heredados (11/12/13/22px, mono): se migrarán a roles en la fase de componentes.
- Tarjetas eliminadas: type-display, type-headings, type-body, type-mono, type-mono-rules, type-commercial.
