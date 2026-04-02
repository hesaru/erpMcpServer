import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../services/authApi'
import { ArrowLeft, UserPlus, Users, AlertCircle, Trash2, Pencil, X, Search, KeyRound } from 'lucide-react'
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
    const [searchQuery, setSearchQuery] = useState('')

    // Edit state
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [editError, setEditError] = useState('')
    const [editLoading, setEditLoading] = useState(false)

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

    const handleDelete = async (user) => {
        if (user.role === 'ADMIN') return
        if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This will also remove their employee profile.`)) return
        try {
            await authApi.deleteUser(user.id)
            loadUsers()
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to delete user'
            alert(msg)
        }
    }

    const handleResetPassword = async (user) => {
        if (user.role === 'ADMIN') return
        const newPassword = window.prompt(`Enter a new temporary password for "${user.username}":`)
        if (!newPassword) return
        try {
            await authApi.resetPassword(user.id, newPassword)
            alert(`Password reset for "${user.username}". They will be required to change it on next login.`)
            loadUsers()
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to reset password'
            alert(msg)
        }
    }

    const startEditing = (user) => {
        if (user.role === 'ADMIN') return
        setEditingUser(user.id)
        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            position: user.position || '',
            role: user.role,
            jiraAccountId: user.jiraAccountId || '',
            githubUsername: user.githubUsername || '',
        })
        setEditError('')
    }

    const cancelEditing = () => {
        setEditingUser(null)
        setEditForm({})
        setEditError('')
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        setEditError('')
        try {
            await authApi.updateUser(editingUser, editForm)
            setEditingUser(null)
            setEditForm({})
            loadUsers()
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to update user'
            setEditError(msg)
        } finally {
            setEditLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            user.username?.toLowerCase().includes(q) ||
            user.fullName?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q) ||
            user.position?.toLowerCase().includes(q) ||
            user.role?.toLowerCase().includes(q)
        )
    })

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
                                Create, edit, and manage all user accounts
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

                    <div className="admin-search-wrapper">
                        <Search size={16} className="admin-search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="admin-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="users-table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Position</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    editingUser === user.id ? (
                                        <tr key={user.id} className="editing-row">
                                            <td colSpan={6}>
                                                <form className="inline-edit-form" onSubmit={handleEditSubmit}>
                                                    <div className="inline-edit-header">
                                                        <h4>Editing: {user.username}</h4>
                                                        <button type="button" className="inline-edit-cancel" onClick={cancelEditing}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    {editError && (
                                                        <div className="login-error" style={{ marginBottom: 'var(--space-3)' }}>
                                                            <AlertCircle size={14} /> {editError}
                                                        </div>
                                                    )}
                                                    <div className="inline-edit-grid">
                                                        <div className="inline-edit-field">
                                                            <label>First Name</label>
                                                            <input name="firstName" value={editForm.firstName} onChange={handleEditChange} />
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>Last Name</label>
                                                            <input name="lastName" value={editForm.lastName} onChange={handleEditChange} />
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>Email</label>
                                                            <input name="email" value={editForm.email} onChange={handleEditChange} />
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>Position</label>
                                                            <input name="position" value={editForm.position} onChange={handleEditChange} />
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>Role</label>
                                                            <select name="role" value={editForm.role} onChange={handleEditChange}>
                                                                <option value="EMPLOYEE">Employee</option>
                                                                <option value="MANAGER">Manager</option>
                                                            </select>
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>Jira Account ID</label>
                                                            <input name="jiraAccountId" value={editForm.jiraAccountId} onChange={handleEditChange} />
                                                        </div>
                                                        <div className="inline-edit-field">
                                                            <label>GitHub Username</label>
                                                            <input name="githubUsername" value={editForm.githubUsername} onChange={handleEditChange} />
                                                        </div>
                                                    </div>
                                                    <div className="inline-edit-actions">
                                                        <button type="button" className="inline-edit-btn-cancel" onClick={cancelEditing}>
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="inline-edit-btn-save" disabled={editLoading}>
                                                            {editLoading ? 'Saving...' : 'Save Changes'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm">
                                                        {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="user-cell-info">
                                                        <span className="user-cell-name">{user.fullName || '—'}</span>
                                                        <span className="user-cell-username">@{user.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                                {user.position || '—'}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                                {user.email || '—'}
                                            </td>
                                            <td>
                                                {user.mustChangePassword ? (
                                                    <span style={{
                                                        color: 'var(--warning)',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 500
                                                    }}>
                                                        Pending
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
                                            <td>
                                                {user.role !== 'ADMIN' && (
                                                    <div className="user-actions">
                                                        <button
                                                            className="user-action-btn edit"
                                                            onClick={() => startEditing(user)}
                                                            title="Edit user"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            className="user-action-btn reset"
                                                            onClick={() => handleResetPassword(user)}
                                                            title="Reset password"
                                                        >
                                                            <KeyRound size={14} />
                                                        </button>
                                                        <button
                                                            className="user-action-btn delete"
                                                            onClick={() => handleDelete(user)}
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
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
