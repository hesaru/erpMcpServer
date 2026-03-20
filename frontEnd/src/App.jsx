import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import EditBacklog from './pages/EditBacklog'
import BacklogManagement from './pages/BacklogManagement'
import EmployeeManagement from './pages/EmployeeManagement'
import EmployeeWellBeing from './pages/EmployeeWellBeing'
import LeaveManagement from './pages/LeaveManagement'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
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

          <Route path="/employee-management" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AppLayout>
                <EmployeeManagement />
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
    </AuthProvider>
  )
}

export default App
