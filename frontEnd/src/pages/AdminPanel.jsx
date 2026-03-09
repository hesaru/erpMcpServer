import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../services/authApi'
import { ArrowLeft, UserPlus, Users, AlertCircle } from 'lucide-react'
import './AdminPanel.css'

const AdminPanel = () => {
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'EMPLOYEE',
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        jiraAccountId: '',
        githubUsername: '',
    })

    const [users, setUsers] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const data = await authApi.getAllUsers()
            setUsers(data)
        } catch (err) {
            console.error('Failed to load users:', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            await authApi.register(formData)
            setSuccess(`User "${formData.username}" created successfully! They will need to change their password on first login.`)
            setFormData({
                username: '',
                password: '',
                role: 'EMPLOYEE',
                firstName: '',
                lastName: '',
                email: '',
                position: '',
                jiraAccountId: '',
                githubUsername: '',
            })
            loadUsers()
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to create user'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-panel">
            <div className="container">
                <header className="admin-header">
                    <div className="admin-header-left">
                        <button className="admin-back-btn" onClick={() => navigate('/')}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1>Admin Panel</h1>
                            <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>
                                Manage users and system settings
                            </p>
                        </div>
                    </div>
                </header>

                {/* Create User Section */}
                <div className="admin-section">
                    <h2>
                        <UserPlus size={22} />
                        Create New Account
                    </h2>

                    {error && (
                        <div className="login-error" style={{ marginBottom: 'var(--space-4)' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="admin-success">{success}</div>
                    )}

                    <form className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                className="form-input"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                className="form-input"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-input"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Temporary Password</label>
                            <input
                                type="password"
                                className="form-input"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Temp password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-input"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@company.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Position</label>
                            <input
                                type="text"
                                className="form-input"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="Software Engineer"
                            />
                        </div>

                        <div className="form-group">
                            <label>Jira Account ID</label>
                            <input
                                type="text"
                                className="form-input"
                                name="jiraAccountId"
                                value={formData.jiraAccountId}
                                onChange={handleChange}
                                placeholder="e.g. 712020:9804d59a-..."
                            />
                        </div>

                        <div className="form-group">
                            <label>GitHub Username</label>
                            <input
                                type="text"
                                className="form-input"
                                name="githubUsername"
                                value={formData.githubUsername}
                                onChange={handleChange}
                                placeholder="e.g. johndoe"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>

                        <button type="submit" className="admin-submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Users List Section */}
                <div className="admin-section">
                    <h2>
                        <Users size={22} />
                        All Users ({users.length})
                    </h2>

                    <div className="users-table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: 600 }}>{user.username}</td>
                                        <td>{user.fullName || '—'}</td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.mustChangePassword ? (
                                                <span style={{
                                                    color: 'var(--warning)',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 500
                                                }}>
                                                    Pending Password Change
                                                </span>
                                            ) : (
                                                <span style={{
                                                    color: 'var(--success)',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 500
                                                }}>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel
