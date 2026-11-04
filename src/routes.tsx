import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import CommercialRFQPage from './pages/CommercialRFQPage'
import RFQDetailPage from './pages/RFQDetailPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import QuotationsPage from './pages/QuotationsPage'
import ComparisonPage from './pages/ComparisonPage'
import SpecEvidenceRedirect from './components/comparison/SpecEvidenceRedirect'
import SupplierDirectoryPage from './pages/SupplierDirectoryPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import RouteError from './pages/RouteError'
import { getToken } from './api/client'
import { useAuth } from './hooks/useAuth'

// Only checks token — used for /onboarding itself to avoid an infinite redirect loop.
function ProtectedRouteBase({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Checks token + whether onboarding is complete.
function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, userLoading } = useAuth()
  if (userLoading) return null
  if (user && !user.first_name) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return <OnboardingGate>{children}</OnboardingGate>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  if (getToken()) return <Navigate to="/" replace />
  return <>{children}</>
}

// A Supabase recovery link may land on the site root (e.g. when triggered from
// the Supabase dashboard, which redirects to the Site URL, not our
// redirect_to) with the session in the URL hash. Route it to the reset page
// before the router resolves, so the token isn't lost to the auth redirect.
if (
  typeof window !== 'undefined' &&
  window.location.hash.includes('type=recovery') &&
  window.location.pathname !== '/reset-password'
) {
  window.history.replaceState(null, '', `/reset-password${window.location.hash}`)
}

// Catálogo del design system: solo en desarrollo (no llega al build de producción).
const DesignSystemShowcase = import.meta.env.DEV ? lazy(() => import('./design-system/showcase/DesignSystemShowcase')) : null
const DesignSystemParity = import.meta.env.DEV ? lazy(() => import('./design-system/showcase/Parity')) : null
const devRoutes: RouteObject[] = DesignSystemShowcase && DesignSystemParity
  ? [
      { path: '/_ds', element: <Suspense fallback={null}><DesignSystemShowcase /></Suspense> },
      { path: '/_ds/parity', element: <Suspense fallback={null}><DesignSystemParity /></Suspense> },
    ]
  : []

export const router = createBrowserRouter([
  ...devRoutes,
  {
    path: '/onboarding',
    element: <ProtectedRouteBase><OnboardingPage /></ProtectedRouteBase>,
  },
  {
    path: '/login',
    element: <PublicOnly><LoginPage /></PublicOnly>,
  },
  {
    path: '/register',
    element: <PublicOnly><RegisterPage /></PublicOnly>,
  },
  {
    path: '/forgot-password',
    element: <PublicOnly><ForgotPasswordPage /></PublicOnly>,
  },
  {
    // Not PublicOnly: the recovery link may be opened while a stale token is
    // still in localStorage, and the user must still be able to reset.
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <DashboardPage />, handle: { titleKey: 'seo.dashboard' } },
      { path: 'requests', element: <RequestsPage />, handle: { titleKey: 'seo.requests' } },
      { path: 'rfqs/new', element: <CommercialRFQPage />, handle: { titleKey: 'seo.rfqNew' } },
      { path: 'rfqs/new/legacy', element: <Navigate to="/rfqs/new" replace /> },
      { path: 'rfqs/:id/edit', element: <CommercialRFQPage />, handle: { titleKey: 'seo.rfqEdit' } },
      { path: 'rfqs/:id', element: <RFQDetailPage />, handle: { titleKey: 'seo.rfqDetail' } },
      { path: 'rfqs/:id/comparison', element: <ComparisonPage />, handle: { titleKey: 'seo.comparison' } },
      { path: 'quotes/:id', element: <QuoteDetailPage />, handle: { titleKey: 'seo.quoteDetail' } },
      { path: 'quotes/:id/spec-evidence', element: <SpecEvidenceRedirect /> },
      { path: 'quotations', element: <QuotationsPage />, handle: { titleKey: 'seo.quotations' } },
      { path: 'suppliers', element: <SupplierDirectoryPage />, handle: { titleKey: 'seo.suppliers' } },
      { path: 'suppliers/:id', element: <SupplierDetailPage />, handle: { titleKey: 'seo.supplierDetail' } },
      { path: 'settings', element: <SettingsPage />, handle: { titleKey: 'seo.settings' } },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
