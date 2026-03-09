import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authApi from '../services/authApi'
import { Shield, User, Lock, AlertCircle, KeyRound } from 'lucide-react'
import './LoginPage.css'

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Change password modal
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [changeError, setChangeError] = useState('')
    const [changeLoading, setChangeLoading] = useState(false)

    const { login, updateUser } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await login(username, password)

            if (response.mustChangePassword) {
                setCurrentPassword(password)
                setShowChangePassword(true)
                setLoading(false)
                return
            }

            navigate('/')
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Login failed'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setChangeError('')

        if (newPassword !== confirmPassword) {
            setChangeError('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setChangeError('Password must be at least 6 characters')
            return
        }

        setChangeLoading(true)

        try {
            await authApi.changePassword(currentPassword, newPassword)
            updateUser({ mustChangePassword: false })
            setShowChangePassword(false)
            navigate('/')
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to change password'
            setChangeError(msg)
        } finally {
            setChangeLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <Shield size={28} strokeWidth={1.8} />
                        </div>
                    </div>

                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your ERP account to continue</p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="username"
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <User size={18} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock size={18} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading || !username || !password}
                        >
                            {loading && <span className="spinner" />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        Smart Project Manager &middot; ERP System
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <KeyRound size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                            <h2>Change Your Password</h2>
                            <p>You must change your temporary password before continuing.</p>
                        </div>

                        {changeError && (
                            <div className="login-error" style={{ marginBottom: 'var(--space-4)' }}>
                                <AlertCircle size={16} />
                                {changeError}
                            </div>
                        )}

                        <form className="modal-form" onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <div className="form-input-wrapper">
                                    <input
                                        id="newPassword"
                                        type="password"
                                        className="form-input"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <Lock size={18} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="form-input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className="form-input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <Lock size={18} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="modal-btn"
                                disabled={changeLoading || !newPassword || !confirmPassword}
                            >
                                {changeLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoginPage
