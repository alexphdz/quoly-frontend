# Quoly 2.0 Design System

Sistema de diseño de Quoly ("Chromatic Graphite + Colorfield"), creado en Claude Design e implementado en `src/design-system/`. Las especificaciones de origen están en `guidelines/`.

Mantra: **composición controlada, no contenedores decorativos**. Una región lleva contenedor solo cuando su función lo requiere.

## Estructura

```
src/design-system/
  tokens/        CSS de tokens (color, tipografía, espaciado, movimiento, iconos,
                 navegación, tabla, estructura y alias de dominio)
  fonts/         Outfit + Inter variables (woff2, subconjunto latino) y licencias OFL
  assets/        logotipos
  components/    componentes TSX + SCSS por familia
  showcase/      catálogo de verificación (solo desarrollo, ruta /_ds)
  index.scss     estilos del DS (se importa en src/main.tsx)
  index.ts       API pública de componentes
```

Para importar componentes:

```tsx
// ruta relativa a src/design-system (no hay alias de importación)
import { Button, DataTable, StatusBadge } from '../design-system'
```

## Fundamentos

| Área | Tokens | Especificación |
|---|---|---|
| Color | Primitivas `--q-*` (valores) · roles `--color-*` (usar siempre) · datos `--color-dv-*` | `guidelines/color-system.md` |
| Tipografía | `--font-display` (Outfit) · `--font-text` (Inter) · roles `--type-*` y clases `.q-type-*` | `guidelines/typography-system.md` |
| Espacio | `--space-*` (base 4px) · `--gap-*` · `--inset-*` · `--radius-*` · `--elevation-*` · densidad con `data-density` | `guidelines/spatial-system.md` |
| Iconos | Vocabulario Phosphor curado (`QUOLY_ICONS`) + Quoly Intelligence Graph | `guidelines/iconography-system.md` |
| Movimiento | `--motion-*` (estándar), `--nav-*`, `--table-*`, `--struct-*`; `prefers-reduced-motion` anula duraciones | — |

- **Tema:** `data-theme="light" | "dark"` en `<html>`, gestionado por `ThemeProvider` (`src/components/ui/theme.tsx`). El modo oscuro es un sistema propio, no una inversión.
- **Marca coral** (`--color-brand`): interacción, foco y selección. Nunca significa "correcto" ni "mejor".
- **Enlaces:** se aplica la clase `.q-link` (texto primario + subrayado coral). El estilo es opcional para no alterar los `<a>` existentes.
- **Reglas de integridad:**
  - un dato ausente no es cero;
  - lo propuesto por IA no está confirmado;
  - comparable ≠ seleccionado ≠ adjudicado;
  - sin rankings, puntuaciones ni etiquetas de "mejor";
  - los datos de demo se marcan como ficticios.

## Componentes implementados

- **05A · Base**
  - actions: Button, IconButton, TextButton, SplitButton, ButtonGroup
  - inputs: Field, TextInput, Textarea, NumberInput, SearchInput, CurrencyInput, Select, MultiSelect, DateInput
  - selection: Checkbox, Radio, Switch, SegmentedControl
  - indicators: StatusBadge, Tag, Chip, Counter, NotificationIndicator, Progress
  - feedback: ValidationMessage, InlineAlert, Tooltip, Popover, Toast + `notify()`, Spinner, Skeleton, EmptyState
  - auxiliary: Divider, Avatar, Kbd, Breadcrumbs, Menu, Tabs
  - navigation: Sidebar, SidebarItem, MobileNavDrawer, QuolyMark
- **05B.1 · Tabla**
  - DataTable, TableCell, TableToolbar y TablePagination
  - estados integrados de carga, vacío, sin resultados y recuperación
- **05B.2 · Estructura**
  - SectionHeader, ContentSection, InfoGroup, KeyValueGroup, Metric/MetricGroup, ContextPanel, DetailPanel, Expandable y EmptySection
  - overlays: Dialog, ConfirmDialog, SideSheet y Drawer

- **05C.1 · Solicitudes y proveedores:** RfqHeader, RfqLifecycle, RfqSummary, ResponseTracker, SupplierRow (+ SupplierRowHeader), SupplierQuestion
- **05C.2 · Quote Intelligence:** ExtractionSummary, ExtractedField, EvidenceReference/EvidencePanel, FieldReviewEditor, ExtractionCompleteness, ReviewWorkspace
- **05C.3 · Comparación:** ComparisonOverview, SupplierComparisonHeader, ComparisonMatrix, ComparisonFocus, PriceDifference, CommercialException (+ Detail), ComparisonEvidenceLink
- **05C.4 · Decisión:** SelectionIndicator, DecisionCandidate, DecisionSummary, DecisionRationale, DecisionRow (+ header), AwardConfirmation, AwardRecord, DecisionTimeline

**Pendiente.** Componentes de dominio restantes, siguiendo sus guidelines:
- Charts (`charts.md`)
- Compositions (`compositions.md`)
- Forms (`form-extensions.md`)

Sus tokens ya están cargados.

## Convenciones de implementación

- Clases con prefijo `q-`. Los estados (hover, active, foco) van en CSS con `:hover`, `:active` y `:focus-visible`, no en JS.
- Los comportamientos accesibles complejos usan Radix:
  - Dialog y AlertDialog;
  - Popover y Tooltip;
  - DropdownMenu.
- Los textos por defecto de los componentes salen del namespace i18n `ds` (`src/i18n/locales/{es,en}/ds.json`). Toda prop de texto se puede sobrescribir.
- Las cifras usan la configuración regional de la app (`useFormat`) con cifras tabulares.

## Puente de compatibilidad (temporal)

`src/styles/tokens-bridge.scss` redirige los tokens anteriores a los roles nuevos. Así, las pantallas actuales toman la nueva paleta y tipografía sin cambiar su marcado:
- `--bg-*`, `--tx-*`, `--line*`, `--accent*`, `--ice*`;
- `--success-*`, `--warn-*`, `--danger-*`, `--info-*`;
- el set legacy de `src/index.css`.

**No usar estos alias en trabajo nuevo.** Se eliminarán a medida que cada pantalla migre a los componentes y tokens del DS.

## Verificación visual

```bash
npm run dev
```

Abrir `http://localhost:5173/_ds`. La ruta solo existe en desarrollo e incluye todas las familias con sus estados, y un selector de tema claro/oscuro.

## Paridad con la referencia

`/_ds/parity` (solo desarrollo) renderiza los casos de `src/design-system/showcase/parity-cases.json`. El mismo JSON se puede renderizar con el bundle del zip de Claude Design para comparar medidas y estilos computados caso por caso.

**Nota:** las fichas `*.card.html` del zip aplican la fuente base al `<html>`, y eso deja `rem` = 14px (todo ~12,5% más chico que la especificación). La app sigue la especificación: `rem` = 16px y body 14px.
