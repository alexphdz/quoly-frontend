import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RequestsPage from './pages/RequestsPage'
import CommercialRFQPage from './pages/CommercialRFQPage'
import RFQDetailPage from './pages/RFQDetailPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import QuotationsPage from './pages/QuotationsPage'
import ComparisonPage from './pages/ComparisonPage'
import SpecEvidencePage from './pages/SpecEvidencePage'
import SupplierDirectoryPage from './pages/SupplierDirectoryPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import SettingsPage from './pages/SettingsPage'
import { getToken } from './api/client'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  if (getToken()) return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicOnly><LoginPage /></PublicOnly>,
  },
  {
    path: '/register',
    element: <PublicOnly><RegisterPage /></PublicOnly>,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'rfqs/new', element: <CommercialRFQPage /> },
      { path: 'rfqs/new/legacy', element: <Navigate to="/rfqs/new" replace /> },
      { path: 'rfqs/:id/edit', element: <CommercialRFQPage /> },
      { path: 'rfqs/:id', element: <RFQDetailPage /> },
      { path: 'rfqs/:id/comparison', element: <ComparisonPage /> },
      { path: 'quotes/:id', element: <QuoteDetailPage /> },
      { path: 'quotes/:id/spec-evidence', element: <SpecEvidencePage /> },
      { path: 'quotations', element: <QuotationsPage /> },
      { path: 'suppliers', element: <SupplierDirectoryPage /> },
      { path: 'suppliers/:id', element: <SupplierDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
