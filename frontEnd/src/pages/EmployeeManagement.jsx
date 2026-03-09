import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import employeeApi from '../services/employeeApi'
import { ArrowLeft, Search, Plus, X, Trash2, User, AtSign, Briefcase, Calendar, Mail } from 'lucide-react'
import './PageLayout.css'
import './EmployeeManagement.css'

const EmployeeManagement = () => {
    const navigate = useNavigate()
    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        position: '',
        email: '',
        dateOfJoining: ''
    })

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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await employeeApi.createEmployee(formData)
            setShowForm(false)
            setFormData({
                firstName: '',
                lastName: '',
                userName: '',
                position: '',
                email: '',
                dateOfJoining: ''
            })
            fetchEmployees()
        } catch (err) {
            alert('Failed to create employee')
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
                        Manage your team members and their details
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
                    <button
                        className={`emp-toggle-form-btn ${showForm ? 'active' : ''}`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Employee</>}
                    </button>
                </div>

                {/* Add Employee Form */}
                {showForm && (
                    <div className="emp-form-card fade-in">
                        <h3 className="emp-form-title">New Employee</h3>
                        <form onSubmit={handleSubmit} className="emp-form">
                            <div className="emp-form-grid">
                                <div className="emp-field">
                                    <label><User size={14} /> First Name</label>
                                    <input
                                        required
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="emp-field">
                                    <label><User size={14} /> Last Name</label>
                                    <input
                                        required
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="emp-field">
                                    <label><AtSign size={14} /> Username</label>
                                    <input
                                        required
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="emp-field">
                                    <label><Mail size={14} /> Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="emp-field">
                                    <label><Briefcase size={14} /> Position</label>
                                    <input
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="Enter position"
                                    />
                                </div>
                                <div className="emp-field">
                                    <label><Calendar size={14} /> Date of Joining</label>
                                    <input
                                        type="date"
                                        name="dateOfJoining"
                                        value={formData.dateOfJoining}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="emp-form-actions">
                                <button type="button" className="emp-btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="emp-btn-primary">
                                    <Plus size={16} /> Save Employee
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
