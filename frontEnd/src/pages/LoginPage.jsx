import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authApi from '../services/authApi'
import { Shield, User, Lock, AlertCircle, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react'
import './LoginPage.css'

// Import slideshow images
import slide1 from '../images/slide_1.png'
import slide2 from '../images/slide_2.png'
import slide3 from '../images/slide_3.png'

const slides = [
    {
        image: slide1,
        title: 'AI-Powered Project Management',
        subtitle: 'Streamline workflows with intelligent analytics and real-time insights.'
    },
    {
        image: slide2,
        title: 'Team Collaboration',
        subtitle: 'Connect your workforce and foster seamless collaboration across teams.'
    },
    {
        image: slide3,
        title: 'Smart Decision Making',
        subtitle: 'Data-driven intelligence to help you make better decisions, faster.'
    }
]

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)

    // Change password modal
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [changeError, setChangeError] = useState('')
    const [changeLoading, setChangeLoading] = useState(false)

    const { login, updateUser } = useAuth()
    const navigate = useNavigate()

    // Auto-advance slideshow
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const goToSlide = (index) => setActiveSlide(index)
    const prevSlide = () => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length)
    const nextSlide = () => setActiveSlide(prev => (prev + 1) % slides.length)

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
            {/* ─── Left: Slideshow ─── */}
            <div className="login-slideshow">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`slide ${index === activeSlide ? 'active' : ''}`}
                    >
                        <img src={slide.image} alt={slide.title} className="slide-image" />
                        <div className="slide-overlay"></div>
                    </div>
                ))}

                {/* Slide Content */}
                <div className="slide-content">
                    <div className="slide-brand">
                        <div className="slide-brand-icon">
                            <Shield size={22} strokeWidth={2} />
                        </div>
                        <span className="slide-brand-text">Smart ERP</span>
                    </div>

                    <div className="slide-text">
                        <h2 className="slide-title" key={activeSlide}>
                            {slides[activeSlide].title}
                        </h2>
                        <p className="slide-subtitle" key={`sub-${activeSlide}`}>
                            {slides[activeSlide].subtitle}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="slide-nav">
                        <div className="slide-dots">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`slide-dot ${index === activeSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                        <div className="slide-arrows">
                            <button className="slide-arrow" onClick={prevSlide}>
                                <ChevronLeft size={18} />
                            </button>
                            <button className="slide-arrow" onClick={nextSlide}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right: Login Form ─── */}
            <div className="login-form-side">
                <div className="login-form-container">
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
                                    <User size={18} className="form-input-icon" />
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
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="form-input-wrapper">
                                    <Lock size={18} className="form-input-icon" />
                                    <input
                                        id="password"
                                        type="password"
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
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
                                    <Lock size={18} className="form-input-icon" />
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
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="form-input-wrapper">
                                    <Lock size={18} className="form-input-icon" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className="form-input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
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
