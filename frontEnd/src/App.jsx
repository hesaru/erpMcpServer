import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EditBacklog from './pages/EditBacklog'
import BacklogManagement from './pages/BacklogManagement'
import EmployeeManagement from './pages/EmployeeManagement'
import EmployeeWellBeing from './pages/EmployeeWellBeing'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/edit-backlog" element={<EditBacklog />} />
        <Route path="/backlog-management" element={<BacklogManagement />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
        <Route path="/employee-wellbeing" element={<EmployeeWellBeing />} />
      </Routes>
    </Router>
  )
}

export default App
