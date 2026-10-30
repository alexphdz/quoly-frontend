# Gráficas y visualización de datos — Fase 06A

Componentes en `components/charts/` · tokens en `tokens/charts.css` (alias sobre Colorfield y neutrales; sin colores nuevos).

## Paleta de series (estable en light y dark)
violet #9A83EC · coral #F58B7B · yellow #F0BF5C · mint #5CB99E · blue #649BEB · pink #E39AC9 · olive #A4BD64 · teal #5EBFC2 → `--chart-<nombre>`. Pasa el nombre como `color`. Solo para series o categorías; nunca sustituye success, warning, error, IA o brand. Un color = una categoría por composición. El amarillo tiene bajo contraste sobre blanco: acompáñalo siempre de valor textual o tabla.

## Jerarquía
Primario: valores y marcas · secundario: ejes, etiquetas, leyendas · terciario: gridlines (`--chart-grid`), base en cero (`--chart-baseline`). Sin marco alrededor del trazado, sin sombras, 3D ni degradados. Títulos fuera del área de trazado (ChartHeader). Contenedor opcional: padding 24; en composiciones abiertas, 0.

## Componentes compactos (dirección visual principal)
- **CompactDonut** — anillo Ø112/17 + leyenda analítica con línea de proporción de 2 px por categoría.
- **SegmentedDistribution** — cifra Outfit 28 + columnas de categoría + barra segmentada de 9 px (gap 4, radio 3).
- **RadialGauge** — semicírculo de 28 segmentos individuales; activos = round(% / 100 × 28).
- **CompactBars** — cifra clave + barras de 64 px bajo el título.
Tile compartido: padding 16, radio 8, superficie sobre canvas, sin borde ni sombra, título Inter 13. Espaciado 4 / 8 / 12 / 16 / 20. Misma categoría = mismo color en todos los tiles. Cada patrón conserva su anatomía; no se unifican en una plantilla genérica.

## Familias
1. **ChartHeader** — contexto 11/600, título Outfit 20, valor Outfit 36/400 tabular. El valor es una estadística real.
2. **BarChart / HBarChart** — 160/240/320; barras 20–34, radio superior 4, siempre desde cero. Horizontal: barra 14, paso 40, etiqueta 180, valor a la derecha.
3. **LineChart** — segmentos rectos, 2.5/2 px, área plana 11 %/14 %. null corta la línea.
4. **DonutChart** — Ø220/22 o Ø148/16, separación 2 px, valor central Outfit 32. Solo partes de un total.
5. **DistributionChart** — histograma calculado de valores crudos; mediana/cuartiles calculados; < 5 valores → estado vacío.
6. **DotPlot** — escala común, punto r5→r6, “No comparable” sin punto. La posición no indica ganador.
7. **ChartTooltip / ChartLegend** — superficie elevation-2, valor Inter 16/600; leyenda Inter 12, muestra 8.
8. **ChartState / ChartNote / ChartDataTable** — carga con geometría, vacío (05B.2), sin resultados, error (05B.1), parcial explicado, tabla visible.

## Movimiento (`--chart-dur-*`, easing `--chart-ease`)
hover 140 · tooltip 120 · barras 360 (una vez) · línea 420 (una vez) · actualización 240 · guía 100. Todo a 0 con reduced motion. Sin animación continua salvo la carga (pulso 1500 ms).

## Accesibilidad
Cada gráfica es un grupo enfocable con nombre (ariaLabel), navegación por flechas/Inicio/Fin/Escape, anillo de foco, anuncio aria-live y tabla de datos oculta. En gráficas densas añade ChartDataTable. Ningún estado depende solo del color.

## Integridad
Datos de demostración siempre etiquetados como ficticios. No generar valores aleatorios, no interpolar periodos faltantes, no mostrar ausentes como cero, no inferir tendencias ni ahorros.
