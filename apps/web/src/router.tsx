import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/auth-guard.tsx'
import { LoginPage } from './pages/login-page.tsx'
import { DashboardPage } from './pages/dashboard-page.tsx'
import { OpsPage } from './pages/ops-page.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AuthGuard><DashboardPage /></AuthGuard>} />
      {/* /ops is server-side guarded only (NODE_ENV + OPS_ENABLED + OPS_SECRET) — no AuthGuard here */}
      <Route path="/ops" element={<OpsPage />} />
    </Routes>
  )
}
