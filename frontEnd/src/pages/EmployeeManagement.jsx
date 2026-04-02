import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import employeeApi from '../services/employeeApi'
import { ArrowLeft, Search, Trash2, User, Users } from 'lucide-react'
import './PageLayout.css'
import './EmployeeManagement.css'

const EmployeeManagement = () => {
    const navigate = useNavigate()
    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchEmployees()
    }, [])

    useEffect(() => {
        if (searchQuery) {
            handleSearch()
        } else {
            fetchEmployees()
        }
    }, [searchQuery])

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await employeeApi.getAllEmployees()
            setEmployees(data)
        } catch (err) {
            setError('Failed to load employees.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            const data = await employeeApi.searchEmployees(searchQuery)
            setEmployees(data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return
        try {
            await employeeApi.deleteEmployee(id)
            setEmployees(employees.filter(emp => emp.id !== id))
        } catch (err) {
            alert('Failed to delete employee')
            console.error(err)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">👥</div>
                    <h1>Employee Management</h1>
                    <p className="page-description">
                        View and manage employee profiles. To add new employees, use the Admin Panel.
                    </p>
                </div>

                {/* Controls */}
                <div className="emp-controls">
                    <div className="emp-search-wrapper">
                        <Search size={16} className="emp-search-icon" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="emp-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Employee Table */}
                <div className="page-content">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading employees...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <div className="error-icon">⚠️</div>
                            <h3>Error</h3>
                            <p>{error}</p>
                            <button className="retry-button" onClick={fetchEmployees}>Retry</button>
                        </div>
                    ) : (
                        <div className="emp-table-wrapper">
                            <div className="emp-table-header">
                                <span className="emp-count">{employees.length} employees</span>
                            </div>
                            <table className="emp-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Username</th>
                                        <th>Position</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th className="emp-th-actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(employee => (
                                        <tr key={employee.id}>
                                            <td>
                                                <div className="emp-name-cell">
                                                    <div className="emp-avatar">
                                                        {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                                    </div>
                                                    <span className="emp-fullname">{employee.firstName} {employee.lastName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="emp-username">@{employee.userName}</span>
                                            </td>
                                            <td>
                                                <span className="emp-position">{employee.position || '—'}</span>
                                            </td>
                                            <td>
                                                <span className="emp-email">{employee.email || '—'}</span>
                                            </td>
                                            <td>
                                                <span className="emp-date">{formatDate(employee.dateOfJoining)}</span>
                                            </td>
                                            <td className="emp-td-actions">
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="emp-delete-btn"
                                                    title="Delete employee"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="emp-empty-row">
                                                <div className="emp-empty-content">
                                                    <Users size={32} />
                                                    <p>No employees found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeManagement
