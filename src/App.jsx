import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { RequireAuth, RequireRole } from './auth/RequireAuth.jsx'
import { AppLayout } from './components/layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TicketsPage from './pages/TicketsPage.jsx'
import TicketDetailPage from './pages/TicketDetailPage.jsx'
import TicketCreatePage from './pages/TicketCreatePage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route
                  path="tickets/new"
                  element={
                    <RequireRole roles={['admin', 'agent']}>
                      <TicketCreatePage />
                    </RequireRole>
                  }
                />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route
                  path="users"
                  element={
                    <RequireRole roles={['admin', 'supervisor']}>
                      <UsersPage />
                    </RequireRole>
                  }
                />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
