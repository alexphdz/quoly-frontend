# Auditoría de layout — Quoly 2.0

> Última actualización: 2026-11-03 · Alcance: pantallas autenticadas (01–11) a 1680/1440/1280/1024/768/390 px.
> Método: app local (`localhost:5199`, API staging por proxy) comparada pantalla por pantalla contra los
> prototipos aprobados (`ReDesign/Prototypes.zip`). Objetivo: cero scroll horizontal/doble, y paridad exacta
> con el prototipo en ancho de contenido, aire en los bordes y esqueletos de carga.

## 1. Modelo de contenido correcto (= prototipo)

El contenedor de contenido de **cada** pantalla del prototipo es:

```
max-width: 1312px;  (1160px en Crear)
margin: 0;          (alineado a la izquierda, pegado a la barra lateral)
padding: 28–32px (40px en Proveedores/Config) horizontal;
```

En un viewport de 1680 con la barra lateral **expandida** (256px) esto deja un **gutter de ~112px a la derecha**
= el "aire" intencional del diseño. No es un hueco/bug: es el margen de lectura del prototipo.

| Contenedor | Pantallas | max-width | padding horiz. |
|---|---|---|---|
| `.hm-page` | Inicio | 1312 | 32 |
| `.rq2-page` | Solicitudes, Cotizaciones | 1312 | 32 |
| `.rd2-page` | Detalle, Comparación | 1312 | 32 |
| `.cr2-page` | Crear/editar | 1160 | 40 |
| `.ds-page` | Proveedores, Config, etc. | 1312 | 40 |

## 2. Hallazgos y correcciones de esta auditoría

### H1 · Proveedores: botón "Ver proveedor" y trazo de hover pegados al borde (el reporte)
**Causa:** en la iteración previa quité los topes de ancho para que el contenido **llenara** el área. Eso fue
una sobre-corrección: el prototipo **no llena**, usa el tope de 1312 + padding, lo que da el aire. Al llenar,
la última columna (acciones, "Ver proveedor") y el trazo rojo de hover de la primera columna quedaban pegados
al borde del contenido (solo 32px al viewport).

**Corrección:** restaurar el modelo del prototipo (tope 1312 + 40px de padding en `.ds-page`, alineado a la
izquierda). Medido después, idéntico al prototipo:
- "Ver proveedor": borde derecho en x 1528 → **152px de aire** al viewport (antes 47px).
- Trazo de hover: x 296 → **40px de aire** desde la barra lateral.

> Nota: el hueco "enorme" reportado dos iteraciones atrás era la **barra lateral colapsada** (estado de prueba
> persistido en `localStorage`), que agrandaba el `main` y el gutter a ~285px. Con la barra expandida por
> defecto, el gutter vuelve a los ~112px del prototipo.

### H2 · Scroll horizontal fantasma en Proveedores ≤1280 (resuelto, se mantiene)
Etiqueta `.q-sr-only` (`position:absolute`) en la última celda escapaba al viewport por no tener ancestro
posicionado. Fix vigente: `.q-table-scroll { position: relative }` + guardrail `.app-shell { overflow-x: clip }`.

### H3 · Esqueleto del Detalle no se parecía a la pantalla real (glitch agresivo) — CORREGIDO
**Causa:** el Detalle (04) mostraba `PageSkeleton` (genérico: una barra + 2 bloques grandes) mientras cargaba el
RFQ. La pantalla real es breadcrumb → título+estado+acción → barra de pestañas → cuerpo a 2 columnas (resumen +
panel "Datos de la solicitud"). La transición era un salto brusco.

**Corrección:** nuevo `CommercialRequestDetailSkeleton` que reusa las clases reales (`rd2-page`, `rd2-header`,
`rd2-tabs`, `rd2-body`, `rd2-main`, `rd2-panel`) y coloca skeletons en las mismas cajas → la transición ya no
reflow­ea. También el esqueleto de carga/error usa `.rd2-page` (no el legacy `.page page-wide`).

## 3. Auditoría de esqueletos (todas las pantallas)

| Pantalla | Esqueleto | Exactitud vs. real | Acción |
|---|---|---|---|
| Inicio (01) | Custom (`hm-*` skeletons) | ✅ calca saludo, 2 columnas de atención (número hero + filas), donut circular + leyenda, "Próximas fechas"/"Actividad" | — |
| Solicitudes (02) | `DataTable` state=loading | ✅ es la **misma tabla** con celdas skeleton: columnas, alto de fila (84px) y header (48px) idénticos | — |
| Cotizaciones (08) | `DataTable` | ✅ igual que 02 | — |
| Proveedores (09) | `DataTable` | ✅ columnas/filas idénticas; el filtro Ubicación y los chips sin número ya se alinean (fix previo) | — |
| Detalle (04) | ~~`PageSkeleton` genérico~~ → `CommercialRequestDetailSkeleton` | ✅ ahora calca breadcrumb/título/pestañas/2-col | **Corregido** |
| Cotizaciones tab / Quote (06) | Carga con el RFQ (sin esqueleto propio) | ✅ cubierto por el esqueleto del Detalle | — |
| Comparación (07) | Carga con el RFQ | ✅ cubierto por el esqueleto del Detalle | — |
| Configuración (10) | Sin carga asíncrona visible | ✅ render inmediato, sin salto | — |
| Crear (03) | Sin fetch de lista | ✅ formulario inmediato | — |

Principio aplicado: el esqueleto reusa las **mismas clases de layout** que la pantalla real, así las posiciones
coinciden y sólo cambia el contenido (barras → texto), sin reflow.

## 4. Archivos modificados (esta iteración)

- `src/styles/components/{home,requests-list,request-detail-v2,request-form}.scss` — restaurar `max-width` (tope + gutter).
- `src/styles/components/sidebar.scss` — `.ds-page`: tope 1312 + 40px padding (aire en Proveedores).
- `src/components/requestDetail/CommercialRequestDetailSkeleton.tsx` — **nuevo** esqueleto del Detalle.
- `src/styles/components/request-detail-v2.scss` — estilos `rd2-skel-*` del esqueleto.
- `src/pages/RFQDetailPage.tsx` — usa el nuevo esqueleto en carga.

(Se conservan de la iteración previa: `.q-table-scroll{position:relative}`, `.app-shell{overflow-x:clip}`.)

## 5. Verificación

- Matriz de scroll/overflow 8 pantallas × 6 anchos: **sin scroll horizontal, sin doble scroll** (ver `LAYOUT_TESTS.md`).
- Aire en Proveedores: botón 152px, trazo 40px (= prototipo).
- Esqueleto del Detalle: calca breadcrumb/título/pestañas/2-col.
- `tsc -b`, `oxlint` (sólo warnings preexistentes), `i18n:check`, `build`: OK.
