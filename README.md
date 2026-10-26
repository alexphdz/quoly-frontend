# Quoly — Frontend

Interfaz web de **Quoly**, el espacio de trabajo para compradores que cotizan con proveedores que ya conocen.

Esta aplicación es el lado del comprador: desde aquí se crean solicitudes (RFQ), se eligen proveedores, se revisan las respuestas que la IA leyó de los correos, se comparan las cotizaciones y se registra la decisión. Los proveedores nunca entran aquí; responden por correo. Esta app consume la API del backend (FastAPI) y no contiene lógica de negocio propia más allá de presentación, formularios y estado de interfaz.

- **Producción:** `https://quoly.app`
- **Staging:** `https://staging.quoly.app`
- **Repositorio:** `alexphdz/quoly-frontend`

Para el detalle funcional (pantalla por pantalla) y el sistema visual, ver la sección [Documentación relacionada](#documentación-relacionada).

---

## Qué hace la app (resumen)

- **Solicitudes (RFQ):** crear, guardar borrador, editar y enviar una solicitud comercial corta.
- **Proveedores:** agregarlos desde un directorio privado o solo para una solicitud; cada uno avanza por su propia etapa.
- **Respuestas entrantes:** leer los correos de los proveedores con lo que la IA extrajo (cotización, evidencia técnica, preguntas), corregir lo que haga falta y responder (incluida una sugerencia de respuesta con IA que el usuario usa o reescribe).
- **Comparación:** ver a los proveedores lado a lado, con un recomendado, y **adjudicar** (la decisión siempre la toma el usuario). Exportar la decisión a PDF.
- **Ajustes:** perfil y foto, tema claro/oscuro, idioma (Español/Inglés), cambio de contraseña y conexión de buzón (Gmail / Outlook).

Nada se adjudica ni se envía de forma automática: la IA propone, el usuario decide.

---

## Sección técnica

### Stack

- **React 19** + **TypeScript** (modo estricto)
- **Vite** como bundler y servidor de desarrollo
- **TanStack Query** para estado del servidor (fetching, cache, revalidación)
- **React Router v7** para el ruteo (SPA)
- **React Hook Form + Zod** para formularios y validación
- **i18next / react-i18next** para internacionalización (Español e Inglés)
- **Tailwind CSS v4** (solo clases utilitarias) + **SCSS** para el design system (tokens de color, tipografía y componentes)
- **Radix UI** (primitivos accesibles), **Phosphor Icons**, **sonner** (notificaciones/toasts), **cmdk** (paleta de comandos), **motion** (animaciones puntuales), **react-day-picker** (fechas), **react-easy-crop** (recorte de avatar)

Nota: `recharts` está instalado, pero las gráficas actuales (dona de etapas, barras de precio) están hechas a mano con SVG/CSS.

### Requisitos

- **Node.js 20 o superior** y **npm**
- El backend corriendo y accesible (ver variable `VITE_API_BASE_URL`)

### Correr en local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar el entorno
cp .env.example .env
#   Ajusta VITE_API_BASE_URL si tu backend no está en http://localhost:8000/api/v1

# 3. Levantar en modo desarrollo
npm run dev
#   Abre la URL que imprime Vite (por defecto http://localhost:5173)
```

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Chequeo de tipos (`tsc`) + build de producción (`vite build`) |
| `npm run preview` | Sirve localmente el build de producción |
| `npm run lint` | Linter (oxlint) |
| `npm run i18n:check` | Verifica que las traducciones ES/EN estén parejas (mismas claves) |
| `npm run test:e2e` | Pruebas end-to-end con Playwright |
| `npm run test:e2e:ui` | Playwright en modo interactivo |

### Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API del backend (incluye `/api/v1`) | `http://localhost:8000/api/v1` (local) · `https://<function-url>/api/v1` (desplegado) |

Las variables de Vite se incrustan en tiempo de build, así que un cambio requiere reconstruir/redeploy. En los despliegues, esta variable se configura en el panel de Vercel por ambiente.

### Estructura del proyecto

```
src/
  api/          Cliente HTTP y llamadas a la API (auth, rfqs, quotes, comparisons, inbound, suppliers)
  components/   Componentes de UI
    ds/           Design system (botones, cards, tabs, menús, diálogos, etc.)
    ui/           Primitivos y utilidades de UI (incluye el proveedor de tema)
    charts/       Gráficas propias (SVG/CSS)
    rfq/, quotes/, comparison/, suppliers/, requestDetail/, settings/, auth/, layout/ ...
  hooks/        Hooks de datos y lógica de interfaz (useAuth, useRFQs, useQuotes, useComparison, ...)
  pages/        Una por ruta (Login, Register, Home, Requests, Detalle, Comparación, Settings, ...)
  i18n/         Configuración y traducciones (locales/en, locales/es)
  lib/          Utilidades (formato, nombres, métricas, modelo de comparación, ...)
  styles/       SCSS: tokens (claro/oscuro), tipografía y estilos por componente
  types/        Tipos TypeScript del dominio
  schemas/      Esquemas de validación (Zod)
  routes.tsx    Definición de rutas
  App.tsx, main.tsx, index.css
```

### Internacionalización

- Idiomas: **Español** e **Inglés**. El idioma se detecta y se guarda; el usuario lo cambia en Ajustes.
- Las traducciones viven en `src/i18n/locales/{en,es}/*.json`, agrupadas por dominio (common, rfq, comparison, inbox, quote, etc.).
- Toda cadena visible debe existir en ambos idiomas. `npm run i18n:check` valida la paridad de claves.

### Estilos y tema (design system)

- El sistema visual es "Graphite + Ice Blue": editorial, sobrio, centrado en la información.
- Todo se resuelve con **variables CSS**. Los tokens de color están en `src/styles/tokens-light.scss` y `tokens-dark.scss`; la tipografía en `src/styles/type.scss`; los estilos por componente en `src/styles/components/*.scss`.
- **Tema claro/oscuro/sistema:** se controla con `data-theme` en `<html>` y se persiste en `localStorage` (`quoly_theme`). El proveedor de tema está en `src/components/ui/theme.tsx`. Por defecto arranca en claro.
- Tailwind v4 aporta solo utilidades; no hay `tailwind.config` ni tema de Tailwind.

### Estado y sesión

- El estado del servidor se maneja con **TanStack Query** (cache y revalidación; algunas vistas refrescan cada ~60s).
- La sesión se guarda como token en `localStorage` (`quoly_token`); el cliente HTTP lo adjunta a las llamadas autenticadas y redirige a login si el token expira.

### Pruebas

- **End-to-end** con Playwright (`e2e/`). Hay varias configuraciones (`playwright*.config.ts`) para distintos escenarios. Se ejecutan con `npm run test:e2e`.

### Build y despliegue

- Hospedado en **Vercel** como SPA estática (el ruteo lo resuelve React Router; `vercel.json` reescribe todas las rutas a `index.html`).
- **Ramas:** el trabajo fluye `dev` → `qa` → `main`.
  - `qa` construye y sirve **staging** (`staging.quoly.app`).
  - `main` construye y sirve **producción** (`quoly.app`).
  - `dev` y ramas de feature **no** despliegan (solo construyen `qa` y `main`).
- `VITE_API_BASE_URL` se define por ambiente en Vercel, apuntando al backend correspondiente.

---

## Convenciones

- Imports relativos (no hay alias `@/`).
- `camelCase` para variables, `PascalCase` para componentes y archivos de componente.
- Commits convencionales, nombres en inglés en el código.
- Toda cadena de texto visible pasa por i18n (ES/EN).

---

## Documentación relacionada

- `docs/GUIA_USUARIO.md` — guía de usuario (qué hace el producto, pantalla por pantalla).
- `docs/QUOLY_DESIGN_SYSTEM.md` — sistema visual en detalle (color, tipografía, superficies).
- A nivel raíz del proyecto: `REPORTE_FUNCIONALIDADES.md` (funcionalidad para diseño) y `REPORTE_DESIGN_SYSTEM.md` (design system para rediseño).
