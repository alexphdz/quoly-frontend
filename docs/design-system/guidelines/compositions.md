# Composiciones analíticas — Fase 06B

Componentes en `components/compositions/`. Combinan las gráficas 06A sin modificarlas. Sin tokens nuevos.

## Principio
Composiciones asimétricas sobre 12 columnas: un dato domina, el resto apoya. Gap 20 · separación entre regiones de contenido 32. Colorfield solo dentro de los gráficos, con el mapeo de 06A.

## Tratamientos de superficie
- **Open** — sin fondo, borde, radio ni sombra. Para secciones editoriales (MetricChart, InsightSection).
- **Unified** — una superficie, radio 12, padding 24 (16 en mobile), borde 1 px --color-divider. Regiones internas separadas por divisores, no tarjetas (OverviewStrip, ComparativeAnalytics).
- **Contrasting** — dos regiones: --surface-context + --color-surface dentro de un contenedor radio 12. Para separar conteo y desglose (ProgressComposition).

## Familias
A. **OverviewStrip** — 3 / 5 / 4, alto mín. 184: métrica Outfit 36 · SegmentedDistribution · RadialGauge o tendencia.
B. **MetricChart** — 35 / 65: Outfit 44/400 anclado a la línea base de una gráfica de 220.
C. **ComparativeAnalytics** — cabecera 48 · gráfica 240 · fila de datos 52 · desglose. Selector de vista SegmentedControl. Sin ranking.
D. **ProgressComposition** — Outfit 32 + gauge + grupos separados de disponibilidad y revisión humana.
E. **InsightSection** — 5 / 7: observación factual Inter 15/500/23 (máx. 560) + gráfica + hasta 3 datos.

## Responsive (por ancho del contenedor)
Desktop ≥ 1000 conserva la asimetría · tablet 640–999 pasa a 2 columnas o apila texto/gráfica · mobile < 640: métrica → gráfica → detalle.

## Movimiento
Cambio de contenido 160 ms de opacidad · cambios de estado 180 ms · las transiciones de las gráficas no cambian · sin elevación al pasar el cursor, sin parallax.

## Integridad
Observaciones solo si se leen en los datos. Sin predicciones, recomendaciones, rankings ni “mejor proveedor”. Disponible ≠ confirmado.
