# Editorial Data Grid — Fase 05B.1-R2

Sustituye el lenguaje visual de la primera propuesta de 05B.1. Componentes: `components/table/` — `DataTable`, `TableCell`, `TableToolbar`, `TablePagination`. Tokens: `tokens/table.css` (alias de tokens aprobados; sin colores nuevos). Estados del sistema: `TableStates.jsx` (interno). Reutiliza Checkbox, IconButton, Button, TextButton, SearchInput, Select y StatusBadge de 05A.

## Variantes
- **Open (predeterminada):** sin caja, radio, sombra ni borde perimetral. Primera y última columna a ras del contenido. Regla estructural de 1px (`--table-rule`: border-structural en light, border-strong en dark) sobre el encabezado y bajo la última fila; divisores de fila `--color-divider`. Toolbar sin caja, alineada al mismo borde.
- **Contained (contextual):** una superficie con borde 1px `--color-border`, radio 8, sin sombra. Padding interior en todas las columnas; toolbar y pie con divisor.

## Encabezado
48 (44 compact) · Inter 12/500/16 +0.01em secundario · divisor 1px border. Grupos opcionales: Inter 11/600 +0.04em sobre una regla de 1px por grupo (`--table-rule-group`), solo cuando correspondan a la estructura de datos. Ordenable: icono 14 con dirección explícita + trazo brand 2px del largo de la etiqueta.

## Filas
| Densidad | Altura mín. | Padding y / x | Texto principal |
|---|---|---|---|
| Compact | 44 | 8 / 12 | Inter 13 |
| Default | 56 | 12 / 16 | Inter 14 |
| Comfortable | 68 | 14 / 20 | Inter 14 + segunda línea |

## Quoly Trace
Solo en filas interactivas (abren detalle o son seleccionables). Margen reservado de 36px al inicio de la celda de identidad; el trazo de 24 × 2 no desplaza el texto.
- Hover: `--table-trace-hover` (brand-300 / brand-700), scaleX 0 → 1, 200 ms cubic-bezier(0.22,1,0.36,1), opacidad 120 ms; salida 140 ms cubic-bezier(0.4,0,0.2,1). Superficie `--color-surface-hover` 140 ms ease-out. El identificador secundario sube a texto primario. Acciones secundarias 0 → 1 en 120 ms.
- Selected: `--table-row-selected` (brand-50 en light; selection-bg al 55% sobre la superficie en dark) + trazo brand permanente + checkbox marcado. Distinto del hover (neutro). Sin cambio de altura.
- Focus-visible: anillo de foco 2px (`--color-focus-ring`), desplazado 4px, solo alrededor de la identidad del registro, acompañado del trazo de hover. Nunca un rectángulo de fila completa. Checkbox y acciones muestran su propio foco.
- Tablas informativas: sin hover ni trazo.

## Celdas
Identidad 14/600 + identificador 12/400 a 3px · monetario 14/600 tabular + ISO 12 + “/ unidad” 12 a 5px (el original en 500 para que el normalizado domine; el normalizado se identifica por su encabezado) · cantidades 14/500 + unidad secundaria · fechas 13/500, color semántico solo con vencimiento real · faltante “—” Inter 14/500 secundario + “No indicado” 12/400 · 1.45, alineado como un valor real; precio no comparable “No comparable” 14/500 + motivo (“Precio por lote sin tamaño de referencia”). Nunca 0, pastilla ni icono de error.

## Estados comerciales
Prominencia `text` (Inter 13/500 en color semántico, sin decoración, predeterminado) · `icon` (StatusBadge quiet, listas densas) · `badge` (StatusBadge subtle, excepcional). El texto nombra el estado; el color solo lo refuerza. “Información faltante” y “No comparable” son neutros con su explicación debajo.

## Acciones
Principal del registro como TextButton siempre visible · secundarias IconButton xs (32 × 32, icono 16) reveladas con hover/foco y siempre visibles en táctil · menú contextual 05A. Máximo una acción de texto y uno o dos iconos por fila.

## Toolbar
Izquierda: nombre (Outfit title-lg en open, title-sm en contained) + conteo Inter 13 + contexto breve. Derecha: grupos (buscar · filtros/ordenar · exportar) a 20px; controles dentro del grupo a 8px. Sin fondo ni tarjeta. Selección: trazo brand + “N seleccionados”.

## Estados del sistema
Todos ocupan el cuerpo del grid bajo el encabezado conservado; el divisor del encabezado (neutro) es la única separación. Sin tarjeta, sombra, icono grande ni borde o barra de color. Entrada: opacidad 160 ms ease-out (sin movimiento con reduced motion).
- **Error · Integrated Recovery State:** A — “DATA UNAVAILABLE” Inter 11/600 +0.08em en status-error-text, WarningCircle 16 opcional. B — título Outfit 24/500 · 1.25 (20 en estrecho) a 12px; descripción Inter 14/1.55 secundaria, máx. 520, a 8px. C — Button secondary md 40 “Reintentar carga” + ArrowClockwise 16, a 24px. Región mín. 240, padding 40/32 (20 bajo 640px). Reintento: loading “Reintentando...”, sin duplicados; éxito → datos; fallo → se conserva con aviso actualizado. El color de error se limita a la zona A.
- **Empty:** eyebrow 11/600 secundario (“NO SUPPLIERS”) · Outfit 26/500 · 1.2 · Inter 14/1.55 · Button primary md a 24px. Mín. 280, padding 40/32. Sin ilustración por defecto; una ilustración solo como variante documentada.
- **No results:** eyebrow “NO MATCHES” · Outfit 22/500 con el término buscado · TextButton “Limpiar búsqueda”. Mín. 200, padding 32. Mantiene la toolbar con la búsqueda activa.
- **Loading:** encabezados reales y geometría estable. Anchos por tipo: proveedor 140–180 + identificador 70–90 a 8px, monetario 80–110, cantidad 55–80, estado 90–120. Alto 12/10, radio 3. Pulso de opacidad 1 → 0.45, 1500 ms ease-in-out alterno; estático con reduced motion.
- **Partial data:** los registros se muestran; cada ausencia se declara en su celda.

## Colorfield
No colorea filas. Solo para datos categóricos reales o visualizaciones con escala y dato visible. Ninguna tabla de esta fase lo necesita.

## Responsive
Scroll horizontal interno. Bajo 900px: padding 12 y primera columna fija. Columnas con `hideBelow` se retiran por prioridad; su información permanece en el detalle del registro. Las filas no se convierten en tarjetas.

**Decisión:** el icono ascendente es `arrow-down` invertido (geometría idéntica a `arrow-up`, ausente del subconjunto). Anterior en paginación: `caret-right` reflejado.
