import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
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
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/backlog-management" element={
            <ProtectedRoute>
              <BacklogManagement />
            </ProtectedRoute>
          } />

          {/* Admin & Manager routes */}
          <Route path="/edit-backlog" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <EditBacklog />
            </ProtectedRoute>
          } />

          <Route path="/employee-management" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeeManagement />
            </ProtectedRoute>
          } />

          <Route path="/employee-wellbeing" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <EmployeeWellBeing />
            </ProtectedRoute>
          } />

          {/* Employee & Manager routes */}
          <Route path="/leave-management" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
              <LeaveManagement />
            </ProtectedRoute>
          } />

          {/* Admin only routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
