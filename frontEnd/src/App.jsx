import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModelProvider } from './context/ModelContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import EditBacklog from './pages/EditBacklog'
import BacklogManagement from './pages/BacklogManagement'
import EmployeeWellBeing from './pages/EmployeeWellBeing'
import LeaveManagement from './pages/LeaveManagement'
import AdminPanel from './pages/AdminPanel'
import { loadConfig } from './config/apiConfig'

function App() {
  const [configReady, setConfigReady] = useState(false)

  useEffect(() => {
    loadConfig().then(() => setConfigReady(true))
  }, [])

  if (!configReady) return null   // wait for config before any API calls

  return (
    <AuthProvider>
      <ModelProvider>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - any authenticated user */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/backlog-management" element={
              <ProtectedRoute>
                <AppLayout>
                  <BacklogManagement />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin & Manager routes */}
            <Route path="/edit-backlog" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AppLayout>
                  <EditBacklog />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/employee-wellbeing" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AppLayout>
                  <EmployeeWellBeing />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Employee & Manager routes */}
            <Route path="/leave-management" element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
                <AppLayout>
                  <LeaveManagement />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin only routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <AdminPanel />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ModelProvider>
    </AuthProvider>
  )
}

export default App
