# Especificación de pruebas de layout y esqueletos — Quoly 2.0

> Define lo que el layout y los esqueletos **deben** cumplir y registra la verificación.
> Última corrida: 2026-11-03. Reproducible con Playwright contra `localhost:5199`.

## 1. Invariantes de layout

Para **cada pantalla** y **cada ancho** (1680/1440/1280/1024/768/390):

- **L1 · Sin scroll horizontal del documento.** `window.scrollTo(600,0)` no cambia `window.scrollX`.
- **L2 · Sin overflow horizontal.** `documentElement.scrollWidth ≤ clientWidth + 1`.
- **L3 · Un solo contenedor de scroll vertical** (sin doble scroll): ≤ 1 elemento con `overflow-y:auto/scroll`
  y alto visible > 150 px, además del documento.
- **L4 · Contenido con tope + gutter (= prototipo).** El contenedor de página tiene `max-width ≤ 1312px`,
  alineado a la izquierda. En anchos ≥ 1568 px (con barra expandida) existe un gutter a la derecha **a propósito**
  (aire de lectura); NO se trata como hueco. La barra lateral está **expandida** por defecto en escritorio.
- **L5 · Barra lateral fija de altura completa** al hacer scroll (`.app-sidebar-slot` top:0…bottom:viewport).
- **L6 · Pestañas del detalle sticky** al hacer scroll (`.rd2-tabs` top ≈ 0).
- **L7 · Las tablas anchas scrollean dentro de `.q-table-scroll`**, nunca en la página (ver L1).

### Resultados L1–L3 (matriz pantalla × ancho) — todas ✅

| Pantalla | 1680 | 1440 | 1280 | 1024 | 768 | 390 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Inicio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solicitudes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear/editar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cotizaciones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proveedores | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configuración | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Detalle | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comparación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Aire en los bordes (Proveedores) — ✅

| Prueba | Esperado (= prototipo) | Medido |
|---|---|---|
| Aire "Ver proveedor" → viewport @1680 | ~150 px | **152 px** ✅ |
| Aire trazo de hover → barra lateral @1680 | ~40 px | **40 px** ✅ |

## 2. Invariantes de esqueletos (anti-glitch)

Para cada pantalla con carga asíncrona, el esqueleto debe **calcar** la pantalla real:

- **S1 · Mismas cajas de layout.** El esqueleto reusa las clases/estructura reales (mismo contenedor, columnas,
  grid) → al cargar no hay reflow de posición.
- **S2 · Tablas:** el esqueleto ES la misma `DataTable` (columnas, alto de fila y header idénticos).
- **S3 · Detalle:** breadcrumb → título+estado+acción → barra de pestañas → cuerpo 2 columnas (resumen + panel).
- **S4 · Contadores/chips** no muestran "0" ni números falsos durante la carga (placeholder o sin número).

### Resultados de esqueletos — ✅

| Pantalla | Criterio | Resultado |
|---|---|---|
| Inicio | S1 (saludo, 2 col atención, donut, 2 col inferiores) | ✅ calca |
| Solicitudes/Cotizaciones/Proveedores | S2 (columnas 288/721/872/1020/1168/1368; fila 84px; header 48px) | ✅ idénticos skeleton vs real |
| Solicitudes/Proveedores | S4 (chips sin número; filtro Ubicación presente) | ✅ |
| Detalle | S3 | ✅ tras reemplazar `PageSkeleton` por `CommercialRequestDetailSkeleton` |
| Cotizaciones tab / Comparación | cargan con el RFQ → cubiertas por S3 | ✅ |
| Configuración / Crear | render inmediato (sin esqueleto) | ✅ sin salto |

## 3. Cómo re-ejecutar

1. `VITE_API_BASE_URL="/api/v1" npx vite --config vite.verify.config.ts --port 5199` + login.
2. **Layout** (por ruta × ancho), en consola:
   ```js
   const bx=window.scrollX; window.scrollTo(600,0); const hScroll=window.scrollX>bx; window.scrollTo(0,0);
   const scrollers=[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);
     return e.scrollHeight>e.clientHeight+4 && /(auto|scroll)/.test(s.overflowY) && e.clientHeight>150;}).length;
   const overflow=document.documentElement.scrollWidth>document.documentElement.clientWidth+1;
   // PASS: !hScroll && scrollers<=1 && !overflow
   ```
3. **Esqueletos**: interceptar la API con retardo (p. ej. `page.route('**/api/v1/**', r=>setTimeout(()=>r.continue(),4000))`),
   navegar, capturar el esqueleto (~1.5 s) y compararlo contra el render real (columnas/posiciones).

## 4. Regresiones a vigilar

- No volver a `width:100%`/`fill` en los contenedores de página: mata el gutter (aire) del prototipo.
- No dejar `.q-sr-only` absolutas sin ancestro posicionado dentro de tablas (reintroduce scroll horizontal).
- No sustituir esqueletos específicos por `PageSkeleton` genérico (reintroduce el glitch del Detalle).
- La barra lateral debe quedar expandida por defecto en escritorio (si no, el gutter se vuelve un hueco lopsided).
