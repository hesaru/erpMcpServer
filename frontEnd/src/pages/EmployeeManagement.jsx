import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import employeeApi from '../services/employeeApi'
import './PageLayout.css'
import './BacklogManagement.css' // Reusing styles or creating new ones

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

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">👥</div>
                    <h1>Employee Management</h1>
                    <p className="page-description">
                        Manage your team members and their details
                    </p>
                </div>

                <div className="backlog-controls glass">
                    <div className="controls-row">
                        <input
                            type="text"
                            placeholder="🔍 Search employees..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="create-button"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancel' : '+ Add Employee'}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="form-container glass fade-in" style={{ marginBottom: '2rem' }}>
                        <form onSubmit={handleSubmit} className="task-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        required
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        required
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        required
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Position</label>
                                    <input
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="Position"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Joining</label>
                                    <input
                                        type="date"
                                        name="dateOfJoining"
                                        value={formData.dateOfJoining}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="submit-button">Save Employee</button>
                        </form>
                    </div>
                )}

                <div className="page-content">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="glass" style={{ padding: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Name</th>
                                        <th style={{ padding: '1rem' }}>Username</th>
                                        <th style={{ padding: '1rem' }}>Position</th>
                                        <th style={{ padding: '1rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(employee => (
                                        <tr key={employee.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem' }}>{employee.firstName} {employee.lastName}</td>
                                            <td style={{ padding: '1rem' }}>@{employee.userName}</td>
                                            <td style={{ padding: '1rem' }}>{employee.position}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No employees found</td>
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
