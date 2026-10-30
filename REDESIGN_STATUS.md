# Rediseño Quoly 2.0 — estado y guía de continuación

> Documento de traspaso para retomar el rediseño en local (Codex u otro agente).
> Rama de trabajo: **`redesign/design-system`**. Último commit incluido aquí: fase 06 Cotizaciones.
> Nombre oficial del producto: **QUOLY** (nunca "QOLI").

---

## 1. Fuentes de verdad (los dos zip)

Ambos zip fueron exportados desde Claude Design. **Todo lo que hay en el zip de prototipos está aprobado**, aunque algunos archivos digan "En revisión".

### 1.1 `Quoly_Design_System.zip` — el sistema de diseño ("Chromatic Graphite + Colorfield")

| Ruta en el zip | Qué es | Dónde quedó en el repo |
|---|---|---|
| `readme.md`, `SKILL.md` | Descripción general del DS y reglas de uso | resumido en `docs/design-system/README.md` |
| `uploads/QUOLY_DESIGN_SYSTEM_MASTER_V2.md` | Documento maestro (principios, voz, reglas) | consultar en el zip |
| `tokens/*.css` (base, charts, colors, comparison, decision, fonts, icons, intelligence, motion, navigation, rfq, spacing, structure, table, typography) | Tokens por rol: `--color-*`, `--type-*`, `--space-*`, `--radius-*`, `--elevation-*`, etc. | `src/design-system/tokens/*.css` (copiados; se quitó la "compatibility layer" de alias deprecados del zip) |
| `fonts/` + `uploads/Inter,Outfit/` | Outfit + Inter (OFL) | `src/design-system/fonts/*.woff2` (subconjunto latino, self-hosted) |
| `assets/logo*.svg`, `uploads/quoly-vector.svg` | Logotipos | `src/design-system/assets/` y `components/navigation/QuolyMark.tsx` |
| `assets/icons/quoly-icons.js` | Mapa de iconos (Phosphor) | reimplementado en `src/design-system/components/core/{Icon.tsx,icons.ts}` sobre `@phosphor-icons/react` |
| `components/<familia>/*.jsx` + `*.d.ts` | Implementación y API de referencia de cada componente | `src/design-system/components/<familia>/*.tsx` + `<familia>.scss` |
| `components/<familia>/*.card.html` | Tarjetas visuales de referencia (estados y variantes) | comparadas contra `/_ds` y `/_ds/parity` (solo en dev) |
| `guidelines/*.md` | Especificaciones escritas | copiadas en `docs/design-system/guidelines/` |
| `guidelines/*.html` | Láminas visuales (color, tipo, espaciado, iconos, layout, etc.) | solo en el zip (no se subieron) |
| `_archive/06C-legacy/` | Objetos antiguos descartados | **no usar** |
| `_ds_bundle.js`, `_ds_manifest.json`, `styles.css`, `_adherence.oxlintrc.json` | Bundle y manifiesto que usa Claude Design | no se usan en el repo |
| `uploads/Geist,Geist_Mono/` | Fuente vieja | **no usar** (Geist fue eliminada) |

Familias de componentes del zip (`components/`): `actions`, `auxiliary`, `charts`, `comparison`, `compositions`, `core`, `decision`, `feedback`, `forms`, `indicators`, `inputs`, `intelligence`, `navigation`, `rfq`, `selection`, `structure`, `table`.

Guidelines `.md` clave (en el zip `guidelines/` y en el repo `docs/design-system/guidelines/`):
`color-system.md`, `typography-system.md`, `spatial-system.md`, `iconography-system.md`, `components-foundation.md`, `data-table-system.md`, `structural-components.md`, `rfq-workflow-components.md`, `quote-intelligence.md`, `quote-comparison.md`, `decision-award.md`, `charts.md`, `compositions.md`, `form-extensions.md`.

### 1.2 `Prototypes.zip` — las pantallas aprobadas

Convención (de `CLAUDE.md` del zip): cada fase tiene `NN - Nombre.dc.html` (página de revisión con variantes, notas e iframe) y `NN - Nombre - Prototipo.dc.html` (prototipo interactivo, con estados por query string). **La fuente funcional es `uploads/REPORTE_FUNCIONALIDADES.md`**. Los prototipos traen una copia del DS en `_ds/quoly-design-system-60a5edcf-eaa0-444a-8ec8-63794c23fe87/` (la misma que el zip del DS).

| Archivo | Pantalla | Parámetros útiles del prototipo |
|---|---|---|
| `00 - Indice.dc.html` | Manifiesto: pantallas, navegación, handoffs | — |
| `01 - Inicio.dc.html` / `01 - Inicio - Prototipo.dc.html` | 01 Inicio | `theme`, `nav`, `name` |
| `02 - Solicitudes.dc.html` / `02 - Solicitudes - Prototipo.dc.html` | 02 Solicitudes | — |
| `03 - Crear editar solicitud.dc.html` / `… - Prototipo.dc.html` | 03 Crear / editar solicitud | ver `_handoff/07 - Form Experience Extensions.md` |
| `04 - Detalle de solicitud.dc.html` / `04 - Detalle de solicitud - Prototipo.dc.html` | 04 Detalle (04A Resumen, 04B Proveedores) | `?tab=resumen|proveedores|respuestas|cotizaciones|comparacion` |
| `04 - Detalle de solicitud copy.dc.html` | duplicado | **ignorar** |
| `05 - Respuestas.dc.html` | 05 Respuestas (pestaña del prototipo 04) | `?tab=respuestas` |
| `06 - Cotizaciones.dc.html` | 06 Cotizaciones (pestaña del prototipo 04) | `?tab=cotizaciones&quote=<proveedor>`, `state=parcial-sin-precio` |
| `07 - Comparacion y adjudicacion.dc.html` | 07 Comparación y adjudicación (pestaña del prototipo 04) | `?tab=comparacion`, `escenario=actual|sin-precios|varias`, demos `elegir`, `ordenado`, `excluida`, `motivo`, `confirmar`, `adjudicado`, `exportar`, `sin-analisis` |
| `08 - Cotizaciones global.dc.html` / `… - Prototipo.dc.html` | 08 Cotizaciones entre solicitudes | filtros `q`, `solicitud`, `revision` |
| `09 - Proveedores - Prototipo.dc.html` | 09 Proveedores (sin página de revisión) | — |
| `10 - Configuracion.dc.html` / `… - Prototipo.dc.html` | 10 Configuración | `seccion=perfil|seguridad|preferencias|correo`; estados `avatar`, `apariencia`, `idioma`, `correos`, `buzon`, `demo=error|exito|desconectar` |
| `11 - Acceso.dc.html` / `… - Prototipo.dc.html` | 11 Acceso (08A): iniciar sesión / crear cuenta | `modo=signin|signup|recover|verify|success`, `demo=campos|email|credenciales` |
| `_handoff/06 - Cotizaciones componentes.md` | Componentes compuestos propuestos para 06 | — |
| `_handoff/07 - Comparacion componentes.md` | Componentes compuestos propuestos para 07 (matriz ampliada, Technical Match Matrix, Suggested Supplier, Decision PDF preview, columna sugerida R2, matriz esencial R2) | — |
| `_handoff/07 - Form Experience Extensions.md` | Patrones de formulario de la fase 03 | — |
| `support.js`, `assets/quoly-icons.js` | Runtime de los prototipos | — |
| `_archivo/` | Capturas de iteraciones | **no son pantallas** |

Para ver un prototipo en local, sirve la carpeta descomprimida con un servidor estático (por ejemplo `python3 -m http.server 5191`) y abre `http://127.0.0.1:5191/06%20-%20Cotizaciones.dc.html` (o el `- Prototipo` con sus parámetros).

---

## 2. Reglas de trabajo acordadas

1. **No cambiar lógica funcional** (hooks, servicios, API, payloads, rutas de negocio). Solo se permiten ajustes menores de lógica de UI.
2. **Reportar** cualquier cosa que necesite cambios en el backend (ver §6).
3. Cada pantalla usa los componentes del DS (`import { … } from '../design-system'`). No hay alias de importación: la ruta es relativa.
4. No modificar el DS para cubrir una pantalla. Si falta un patrón, va como estilo de pantalla y se anota (el zip hace lo mismo con `_handoff/`).
5. Un commit por fase, con mensaje `feat(<área>): Quoly 2.0 <Pantalla> (NN)`.
6. **No dejar procesos corriendo** (vite, http.server) al terminar cada fase.
7. Base de `rem` = 16px (spec del DS). La fuente base va en `body`, no en `html`.
8. Textos del producto en español e inglés (i18n), con el tono del DS: sin "mejor", sin rankings ni lenguaje de venta salvo lo que el usuario apruebe explícitamente (ver la decisión pendiente en 07).

---

## 3. Arquitectura del rediseño en el repo

```
src/design-system/
  tokens/        tokens CSS del zip (sin la compatibility layer)
  fonts/         Outfit + Inter woff2 + licencias OFL
  assets/        logotipos
  components/    <familia>/*.tsx + <familia>.scss, clases con prefijo q-
  showcase/      DesignSystemShowcase (/_ds) y Parity (/_ds/parity), solo en DEV
  hooks.ts       useElementWidth, etc.
  utils.ts
  index.scss     entrada de estilos del DS (importada en src/main.tsx)
  index.ts       barrel público
docs/design-system/README.md + guidelines/*.md
src/styles/tokens-bridge.scss   puente: nombres viejos (--bg-*, --tx-*, --line, --action…) → roles nuevos
src/styles/index.scss           estilos de pantalla (registrar aquí los nuevos .scss)
src/styles/components/*.scss    estilos por pantalla
src/i18n/locales/{en,es}/*.json textos
```

- **Orden de estilos** en `src/main.tsx`: `index.css` (Tailwind + legacy) → `design-system/index.scss` → `styles/index.scss`.
- **Tema:** `data-theme` en `<html>` desde `src/components/ui/theme.tsx`; se guarda en localStorage con la clave `quoly_theme`.
- **Shell:** `src/components/layout/{AppLayout.tsx,Navbar.tsx,useShellLayout.ts}`. Breakpoints: mobile < 640, tablet < 1200, desktop ≥ 1200. Sidebar del DS de 256/68.
- **Prefijos de clases de pantalla:** `hm-` (Inicio), `rq2-` (Solicitudes y listados), `cr2-` (Crear), `rd2-` (Detalle), `rp-` (Respuestas), `qt2-` (Cotizaciones global), `qt3-` (índice de cotizaciones del detalle), `qr2-` (revisión de cotización).
- **Helpers compartidos:** `src/lib/relativeTime.ts` (`useRelativeTime`), `src/lib/requestNav.ts` (`requestDestination`, `useRelativeDays`), `src/lib/homeFeed.ts`, `src/lib/quoteDisplay.ts`.
- **Pestañas del detalle por URL:** `/rfqs/:id?tab=overview|suppliers|replies|quotations|comparison&quote=<id>`. Las preguntas de proveedores se enlazan con `?tab=replies#needs-answer`.
- **i18n:** namespaces usados en el rediseño: `rfq` (`inicio`, `solicitudes`, `crear`, `detalle`, `respuestas`, `cotizaciones`), `quotation` (`v2`), `quote` (`v2`, `v2.tech`), `inbox` (`original`, `documents`). Siempre agregar las claves en `en` y `es`. `npm run i18n:check` valida la paridad.

---

## 4. Qué está completado

### 4.1 Sistema de diseño (100 % de las bases)

| Commit | Contenido |
|---|---|
| `e8ddd37`, `1f6233d` | Limpieza: se quitaron el DS anterior (Graphite + Ice Blue), sus exportaciones, su documentación y sus e2e |
| `415a806` | Tokens, fuentes y estilos base |
| `b422d08` | Puente de tokens legacy → roles Quoly 2.0 (`src/styles/tokens-bridge.scss`, `src/index.css`) |
| `27fab4c` | Iconos sobre Phosphor + `IntelligenceMark` |
| `b6107b9` | 05A Componentes base: actions, inputs, selection, indicators, feedback, auxiliary, navigation |
| `217cb70`, `95c971e` | 05B Tabla y estructura: DataTable, TableCell, TableToolbar, TablePagination, TableStates, SectionHeader, ContentSection, InfoGroup, Metric, KeyValueGroup, ContextPanel, DetailPanel, Expandable, EmptySection, Dialog, ConfirmDialog, SideSheet, Drawer |
| `3761d39` | Showcase solo en DEV: `/_ds` y `/_ds/parity` |
| `dc4bbfe`, `732a415` | Documentación en `docs/design-system/` |
| `24fd573` | Pase de fidelidad contra las `*.card.html` del zip |
| `12f22d5` | 05C.1 RFQ: RfqHeader, RfqLifecycle, RfqSummary, ResponseTracker, SupplierRow, SupplierQuestion |
| `2701658` | 05C.2 Quote Intelligence: EvidenceReference, ExtractedField, ExtractionCompleteness, ExtractionSummary, FieldReviewEditor, ReviewWorkspace |
| `2dae27f` | 05C.3 Comparación: ComparisonMatrix, ComparisonOverview, ComparisonFocus, ComparisonEvidenceLink, CommercialException, PriceDifference, SupplierComparisonHeader |
| `ecf756d` | 05C.4 Decisión: DecisionCandidate, DecisionRow, DecisionSummary, DecisionRationale, DecisionTimeline, AwardConfirmation, AwardRecord, SelectionIndicator |
| `23dfc56` | 06A Charts: BarChart, LineChart, DonutChart, DotPlot, DistributionChart, CompactCharts, ChartHeader, ChartTooltip, ChartState |
| `2acdc26` | 06B Compositions (ComparativeAnalytics, InsightSection, MetricChart, OverviewStrip, ProgressComposition) y 07 Forms (DocumentDropzone, FormSectionNavigator, IncotermExplorer) |

### 4.2 Pantallas

| Fase | Commit | Prototipo de referencia | Archivos principales |
|---|---|---|---|
| Shell / navegación | `5e07d8b` | menú de todos los prototipos | `components/layout/AppLayout.tsx`, `Navbar.tsx`, `src/index.css` |
| 01 Inicio | `79ed4bb` | `01 - Inicio - Prototipo.dc.html` | `pages/DashboardPage.tsx`, `lib/homeFeed.ts`, `layout/useShellLayout.ts`, `styles/components/home.scss`. Se eliminaron `home/HomeBoard.tsx` y `rfq/AttentionCard.tsx` |
| 02 Solicitudes | `77bc247` | `02 - Solicitudes - Prototipo.dc.html` | `pages/RequestsPage.tsx`, `lib/requestNav.ts`, `styles/components/requests-list.scss`. Se eliminó `rfq/RequestsLedgerTable.tsx` |
| 03 Crear / editar | `a6cf01a` | `03 - Crear editar solicitud - Prototipo.dc.html` | `components/rfq/CommercialRFQForm.tsx`, `rfq/commercial/IncotermField.tsx`, `pages/CommercialRFQPage.tsx`, `styles/components/request-form.scss`. Se eliminaron `UnitPicker`, `IncotermPicker` y `RequestStepArt`. El lugar es obligatorio cuando se elige un Incoterm |
| 04 Detalle (Resumen + Proveedores) | `5626d42` | `04 - Detalle de solicitud - Prototipo.dc.html` | `components/requestDetail/{CommercialRequestDetail,OverviewTab,SuppliersTab,RequestPanel}.tsx`, `stages.ts`, `useStageMeta.ts`, `lib/relativeTime.ts`, `styles/components/request-detail-v2.scss`. Se eliminó `rfq/RequestSupplierTable.tsx` |
| 05 Respuestas | `6a7c948` | `04 … Prototipo` con `?tab=respuestas`; `05 - Respuestas.dc.html` | `requestDetail/SupplierQuestions.tsx`, `rfq/InboundList.tsx`, `request-detail-v2.scss` (`rp-*`) |
| 08 Cotizaciones global | `133ad0d` | `08 - Cotizaciones global - Prototipo.dc.html` | `pages/QuotationsPage.tsx`, `requests-list.scss` (`qt2-*`). Se eliminaron ReviewQueue, QuotationsTable, RequestFilter, QuotationsByRfq y QuoteStatusDonut |
| 06 Cotizaciones (pestaña + revisión) | `42b41eb` | `04 … Prototipo` con `?tab=cotizaciones`; `06 - Cotizaciones.dc.html`; `_handoff/06 - Cotizaciones componentes.md` | `requestDetail/QuotesTab.tsx` (nuevo), `quoteReview/QuoteReview.tsx` (reescrito), `quoteReview/TechnicalReview.tsx` (nuevo), `pages/QuoteDetailPage.tsx`, `pages/RFQDetailPage.tsx`, `request-detail-v2.scss` (`rd2-quotes`, `qt3-*`, `qr2-*`) |

Detalle de la fase 06:
- La revisión de una cotización comercial vive en `/rfqs/:id?tab=quotations&quote=<quoteId>`. `/quotes/:id` redirige ahí. Las cotizaciones de corrugado siguen en `/quotes/:id`, con el mismo `QuoteReview` en modo independiente y con breadcrumbs.
- `QuoteReview` conserva toda la lógica: guardar con `expected_approved_revision`, confirmar (si hay cambios, guarda primero), excluir y restaurar, eliminar, volver a leer, normalización, líneas de costo, condiciones e hitos de pago.
- Cada dato se edita por fila (Esc cancela, "Guardar cambio" guarda). Esto reemplaza el botón global "Guardar cambios".
- Cada fila muestra su procedencia: "Leído por Quoly · por revisar", "Confirmado por ti" o "Corregido por ti" con el valor original. "Ver origen" abre un SideSheet con el documento original y el texto resaltado.
- Matriz técnica de solo lectura alimentada por `GET /quotes/:id/spec-evidence`, con los veredictos `match`, `deviation`, `missing_from_supplier`, `not_comparable`, `additional` y `needs_review`.
- "Confirmar cotización" se desactiva si falta el precio en una solicitud no comercial. En una comercial se puede confirmar sin precio, pero no entra a la comparación de precios.
- La carga manual de una cotización se abre en un SideSheet.

### 4.3 Verificación hecha en cada fase
`npx tsc -b`, `npx oxlint` (la línea base tiene **1 error preexistente** en `src/components/ds/index.tsx`), `npm run i18n:check`, `npm run build` y `npx playwright test -c playwright.mocked.config.ts` (4/4). Además se tomaron capturas con Playwright a 1440, 1024, 768 y 390 de ancho, en claro y oscuro, y se compararon contra el prototipo.

Las e2e que usan el backend real (`playwright.config.ts`) se actualizaron a los nuevos textos, pero **no se pudieron correr** sin backend: `commercial-rfq-qa`, `documents-qa`, `buyer-actions-qa` y `quotation-shape-qa`. Hay que correrlas en local.

---

## 5. Qué falta

Avance aproximado: el DS está al 100 %; las pantallas de los prototipos van en 8 de 13 entregas (shell, 01, 02, 03, 04, 05, 06 y 08).

### 5.1 07 Comparación y adjudicación — SIGUIENTE
- Prototipo: `04 - Detalle de solicitud - Prototipo.dc.html?tab=comparacion` (escenarios y demos en §1.2). Página de revisión: `07 - Comparacion y adjudicacion.dc.html`. Handoff: `_handoff/07 - Comparacion componentes.md`.
- Código actual: la pestaña `comparison` de `requestDetail/CommercialRequestDetail.tsx` (todavía usa el viejo `SectionCard` + `comparison/ComparisonPreview`) y la página `pages/ComparisonPage.tsx` (`/rfqs/:id/comparison`), con `components/comparison/*` y los estilos viejos `cmp.scss` y `comparison.scss`.
- Componentes del DS a usar: `design-system/components/comparison/*`, `decision/*`, y `IntelligenceMark` para la sugerencia.
- **Decisión pendiente del usuario:** el prototipo usa los distintivos "Mejor precio", "Menor plazo" y la columna "Sugerido por Quoly" (tinte violeta, ver "R2 · Columna sugerida" en el handoff). Esto choca con la regla del DS de no usar rankings ni "mejor". Hay que confirmar con el usuario antes de implementarlo. Como todo el zip está aprobado, lo más probable es seguir el prototipo.
- Notas del handoff: unificar el formato decimal (punto, `4.62`) en DecisionCandidate, AwardConfirmation y AwardRecord; DecisionCandidate antepone "Original:".
- No cambiar la lógica de `hooks/useComparison.ts` ni la de decisión y adjudicación. El PDF de decisión, si existe un endpoint, solo cambia de presentación (vista previa en SideSheet).
- Al terminar, decidir si `/rfqs/:id/comparison` redirige a `?tab=comparison`, como se hizo con `/quotes/:id`.

### 5.2 09 Proveedores
- Prototipo: `09 - Proveedores - Prototipo.dc.html`.
- Código: `pages/SupplierDirectoryPage.tsx` (`/suppliers`), `pages/SupplierDetailPage.tsx` (`/suppliers/:id`), `components/suppliers/*`, `styles/components/suppliers.scss`.
- La e2e `providers-directory.spec.ts` y `directory-cleanup-qa.spec.ts` dependen de esta pantalla: actualizar sus locators.

### 5.3 10 Configuración
- Prototipo: `10 - Configuracion - Prototipo.dc.html` (secciones `perfil`, `seguridad`, `preferencias`, `correo`). Revisión: `10 - Configuracion.dc.html`.
- Código: `pages/SettingsPage.tsx`, `components/settings/*`, `styles/components/settings.scss`. Conservar la foto de perfil con recorte (`react-easy-crop`), el tema, el idioma y la conexión de buzón (Gmail/Outlook). La e2e `profile-photo.spec.ts` depende de esta pantalla.
- `SettingsPage.tsx` todavía tiene hex sueltos que hay que pasar a tokens.

### 5.4 11 Acceso
- Prototipo: `11 - Acceso - Prototipo.dc.html` (`modo=signin|signup|recover|verify|success`). Revisión: `11 - Acceso.dc.html`.
- Código: `pages/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `components/auth/*`. Conservar la confirmación de correo obligatoria y la recuperación de contraseña. El prototipo deja verificar y recuperar como marcadores (fase 08B): aplicarles el mismo shell de dos regiones sin cambiar los flujos.

### 5.5 Limpieza final
- Borrar los estilos de pantalla viejos que ya no use nada. Candidatos a revisar con grep: `request-detail.scss`, `requests.scss`, `quotations.scss`, `quote-review.scss`, `cmp.scss`, `comparison.scss`, `kpi.scss`, `journey.scss`, `stage-bar.scss`, `pill.scss`, `ask-row.scss`, `ai-panel.scss`, `sidebar.scss`, `tabs.scss`, `table.scss`, `button.scss`, `field.scss`, `modal.scss`, `overlay.scss`, `collapsible.scss`, `foundation.scss`, `commercial-form.scss`, `date-field.scss`. Antes de borrar uno, confirmar con grep que sus clases no aparecen en `src/` ni en `e2e/`.
- Migrar o eliminar `src/components/ds/*` (Btn, Empty, SectionCard, Icon, MetricCard, StatusChips) y `src/components/ui/*` cuando ya no se usen.
- Retirar el puente `src/styles/tokens-bridge.scss` y el set legacy de `src/index.css` cuando ningún estilo use los nombres viejos (`--bg-*`, `--tx-*`, `--line*`, `--action*`, `--surface-*`, `--text-*`, `--brand*`).
- `src/components/charts/stagePalette.ts` y el resto de `src/components/charts/*` (recharts) → pasar a `design-system/components/charts`.
- Revisar los flujos de corrugado (`RFQCorrugatedCreatePage`, `RFQCreatePage`): no tienen prototipo, así que solo heredan los tokens. Hay que preguntar al usuario si entran en el rediseño.
- Arreglar el error de oxlint preexistente en `src/components/ds/index.tsx`.

---

## 6. Pendientes de backend (reportados)

1. **Cambiar veredicto** en la matriz técnica (06). El prototipo lo muestra, pero no hay endpoint para sobrescribir el veredicto de `spec-evidence`. Por ahora es de solo lectura.
2. Ninguno más detectado hasta la fase 06. Seguir reportando en 07 (por ejemplo, si "Sugerido por Quoly" o la vista previa del PDF necesitan datos que el API no devuelve).

---

## 7. Cómo trabajar una fase (receta)

1. Leer el prototipo y su página de revisión (variantes, notas y estados) y la sección del `uploads/REPORTE_FUNCIONALIDADES.md` correspondiente.
2. Localizar la página o componente actual (ver §5) y anotar qué hooks y mutaciones usa. **No se tocan.**
3. Reescribir el markup con componentes del DS. Los estilos de pantalla van en `src/styles/components/<pantalla>.scss` (registrado en `src/styles/index.scss`), usando solo tokens (`var(--color-*)`, `var(--space-*)`, `var(--type-*)`, `var(--radius-*)`).
4. Agregar los textos en `src/i18n/locales/en/*.json` y `es/*.json`.
5. Verificar:
   ```bash
   npx tsc -b && npx oxlint && npm run -s i18n:check && npm run -s build
   ```
   ```bash
   npx playwright test -c playwright.mocked.config.ts
   ```
   Luego, con el backend local, las e2e reales afectadas (`npm run test:e2e -- <spec>`).
6. Comparar visualmente contra el prototipo a 1440, 1024, 768 y 390, en claro y oscuro: `npm run dev` + el prototipo servido en estático. Revisar los estados vacío, carga, error y parcial.
7. Eliminar los componentes viejos que queden sin uso.
8. Commit `feat(<área>): Quoly 2.0 <Pantalla> (NN)` y cerrar vite y el servidor estático.

---

## 8. Mapa rápido ruta → pantalla → estado

| Ruta | Página | Prototipo | Estado |
|---|---|---|---|
| `/` | DashboardPage | 01 | ✅ |
| `/requests` | RequestsPage | 02 | ✅ |
| `/rfqs/new`, `/rfqs/:id/edit` | CommercialRFQPage | 03 | ✅ |
| `/rfqs/:id` (overview, suppliers) | RFQDetailPage → CommercialRequestDetail | 04 | ✅ |
| `/rfqs/:id?tab=replies` | idem | 05 | ✅ |
| `/rfqs/:id?tab=quotations&quote=` | idem → QuotesTab + QuoteReview | 06 | ✅ |
| `/quotes/:id` | QuoteDetailPage (redirige si es comercial) | 06 | ✅ |
| `/rfqs/:id?tab=comparison`, `/rfqs/:id/comparison` | CommercialRequestDetail / ComparisonPage | 07 | ⏳ siguiente |
| `/quotations` | QuotationsPage | 08 | ✅ |
| `/suppliers`, `/suppliers/:id` | SupplierDirectoryPage / SupplierDetailPage | 09 | ⏳ |
| `/settings` | SettingsPage | 10 | ⏳ |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | páginas de auth | 11 | ⏳ |
| `/_ds`, `/_ds/parity` | showcase (solo DEV) | cards del DS | ✅ |
