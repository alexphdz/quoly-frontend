# Structural components — Fase 05B.2
Estructuras generales de información y superposición. Tokens: `tokens/structure.css` (alias sobre 01–03, sin colores nuevos). Componentes: `components/structure/`. Tarjetas: secciones e información · paneles · superficies superpuestas.

## Principio
Una región recibe contenedor visible solo cuando su función lo requiere. Jerarquía por tipografía, alineación y espacio. Las líneas animadas de navegación y filas no se aplican a estas estructuras.

## Jerarquía de contenedores
| Estructura | Fondo | Borde | Radio | Sombra |
|---|---|---|---|---|
| SectionHeader, ContentSection estándar, InfoGroup, Metric, KeyValueGroup, EmptySection, Expandable | transparente | ninguno (divisores estructurales opcionales) | 0 | no |
| ContentSection delimitada | superficie | 1 neutro | 12 | no |
| ContextPanel | secundaria (dark: canvas) | 1 neutro · acoplado: solo izquierdo | 8 · acoplado 0 | no |
| DetailPanel | superficie principal | 1 opcional | 12 | no |
| SideSheet / Drawer | superficie | 1 en el lado interior | Drawer inferior: 12 arriba | elevación 3 solo si es modal |
| Dialog / ConfirmDialog | elevada | 1 sutil | 12 | elevación 3 |

## Medidas
- **SectionHeader:** mín. 48, padding 8/0. Outfit 20/500/26; descripción Inter 13/19 a 4. Acciones/conteo a la derecha, ≥24; bajan en estrecho sin truncar el título. Divisor opcional a 16.
- **ContentSection:** encabezado → contenido 20; entre secciones 40 (`--struct-section-gap`). Delimitada padding 24. Densa padding/gaps 16 sin reducir tipografía.
- **InfoGroup:** etiqueta 12/500 secundaria, valor 15/500, detalle 12/400, gap 4, 24 entre grupos.
- **Metric:** eyebrow 12/500 · Outfit 32/500/1.1 · unidad 13 · detalle 12 · gap 8. Hero Outfit 44/400/1.05, uno por vista. MetricGroup gap 24, divisores verticales solo en una fila. Colorfield (`marker`) solo para categorías; coral de marca nunca como resaltado de KPI; sin flechas sin datos de tendencia.
- **KeyValueGroup:** 2–3 columnas → 2 → 1 (mín. 220/col), 24 × 20. Etiqueta 12/500, valor 14/500; largo 14/400/1.5 a fila completa. Divisor sobre cada par.
- **ContextPanel:** 280–360 (320), padding 20, Outfit 17/500 + icono 16 opcional, 16 al contenido. PanelSection separa temas con divisor. Bajo 900px se reubica bajo el contenido principal; sin scroll anidado.
- **DetailPanel:** contexto 11/600 +0.08em → Outfit 20/500 → Inter 14/1.55 (≈68ch) → metadatos 12 + acciones sobre divisor. Padding 24.
- **Expandable:** cabecera mín. 48, Inter 14/500 + meta 12, caret 16 (160 ms). Contenido 12/16, 180 ms opacidad + 4 px a altura natural.
- **SideSheet:** 480 (máx. 90vw), encabezado 72 · Outfit 22/500 · IconButton; cuerpo 24/24; pie 16/24. 260 ms (0.22,1,0.36,1) entrada, 200 ms (0.4,0,0.2,1) salida.
- **Dialog:** 400 / 480 / 640, padding 24, Outfit 22/500, descripción 14/1.5 a 8, cuerpo +24, pie +24 a la derecha gap 8. 180 ms fade + 8 px.
- **ConfirmDialog:** 440. Título → consecuencia → detalles (etiqueta/valor sobre divisores) → Cancelar + confirmar. Sin icono ni acento. Pendiente: carga y no se puede cerrar.
- **Drawer:** contenido no navegacional. Lateral min(400, 100%−48); inferior hasta 85%, radio superior 12, safe area, acciones apiladas. Cerrar 44. Movimiento de navegación (260/200). MobileNavDrawer (05A) sin cambios.
- **EmptySection:** integrada, mín. 180, padding 32 (densa 24), Outfit 20/500, Inter 14/1.55 máx. 440, acción a 20. No sustituye los estados del Data Grid (05B.1).

## Movimiento
Color 140–160 ms · divulgación 180 ms · hoja 260/200 · diálogo 180. Sin escalado, rebote ni escalonado. Todas las duraciones pasan a 0 con prefers-reduced-motion.

## Accesibilidad
Dialog/SideSheet/Drawer: role dialog (ConfirmDialog: alertdialog), aria-modal, aria-labelledby/-describedby, foco inicial en el primer control (en confirmación, Cancelar), foco atrapado, Escape salvo operación pendiente, foco devuelto al disparador. Expandable: botón con aria-expanded/aria-controls y región etiquetada; contenido cerrado inert. Objetivos táctiles ≥ 44 en móvil.

## Cambio respecto al sistema anterior
`core/Dialog` (heredado, fuera de 05A) se sustituye por `structure/Dialog`; mantiene `open`, `title`, `footer`, `onClose`, `width`, `inline`.
