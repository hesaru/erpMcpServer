import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useModel } from '../context/ModelContext'
import {
    LayoutDashboard,
    FilePlus,
    BarChart3,
    Users,
    Heart,
    CalendarDays,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ChevronDown,
    Bot,
    Sparkles
} from 'lucide-react'
import './Navbar.css'

const MODEL_OPTIONS = [
    { value: 'openai', label: 'OpenAI', icon: <Bot size={14} /> },
    { value: 'gemini', label: 'Gemini', icon: <Sparkles size={14} /> },
]

const Navbar = () => {
    const { user, logout } = useAuth()
    const { selectedModel, setSelectedModel } = useModel()
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

    const currentModel = MODEL_OPTIONS.find(m => m.value === selectedModel) || MODEL_OPTIONS[0]

    const allNavItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Create Task', icon: <FilePlus size={18} />, path: '/edit-backlog', roles: ['ADMIN', 'MANAGER'] },
        { label: 'Backlog', icon: <BarChart3 size={18} />, path: '/backlog-management', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Well Being', icon: <Heart size={18} />, path: '/employee-wellbeing', roles: ['ADMIN', 'MANAGER'] },
        { label: 'Leave', icon: <CalendarDays size={18} />, path: '/leave-management', roles: ['MANAGER', 'EMPLOYEE'] },
        { label: 'Admin', icon: <Settings size={18} />, path: '/admin', roles: ['ADMIN'] },
    ]

    const navItems = allNavItems.filter(item => item.roles.includes(user?.role))

    const handleNavigate = (path) => {
        navigate(path)
        setMobileOpen(false)
    }

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    const handleModelSelect = (model) => {
        setSelectedModel(model)
        setModelDropdownOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <div className="navbar-brand" onClick={() => handleNavigate('/')}>
                    <div className="navbar-logo">
                        <LayoutDashboard size={20} strokeWidth={2.2} />
                    </div>
                    <span className="navbar-title">Smart ERP</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Model Selector */}
                <div className="model-selector-wrapper">
                    <button
                        className="model-selector-trigger"
                        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                        onBlur={() => setTimeout(() => setModelDropdownOpen(false), 200)}
                    >
                        <span className={`model-indicator ${currentModel.value}`}></span>
                        {currentModel.icon}
                        <span className="model-selector-label">{currentModel.label}</span>
                        <ChevronDown size={12} className={`model-chevron ${modelDropdownOpen ? 'open' : ''}`} />
                    </button>
                    {modelDropdownOpen && (
                        <div className="model-dropdown">
                            {MODEL_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    className={`model-dropdown-item ${selectedModel === option.value ? 'active' : ''}`}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        handleModelSelect(option.value)
                                    }}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                    {selectedModel === option.value && (
                                        <span className="model-check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Section */}
                <div className="navbar-user">
                    <div className="navbar-user-info">
                        <div className="navbar-avatar">
                            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="navbar-user-details">
                            <span className="navbar-user-name">{user?.fullName || user?.username}</span>
                            <span className="navbar-user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="navbar-logout" onClick={handleLogout} title="Sign Out">
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="navbar-mobile-menu">
                    <div className="navbar-mobile-items">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                className={`navbar-mobile-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => handleNavigate(item.path)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                <ChevronRight size={14} className="mobile-link-arrow" />
                            </button>
                        ))}
                    </div>

                    {/* Mobile Model Selector */}
                    <div className="mobile-model-selector">
                        <span className="mobile-model-label">AI Model</span>
                        <div className="mobile-model-options">
                            {MODEL_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    className={`mobile-model-option ${selectedModel === option.value ? 'active' : ''}`}
                                    onClick={() => handleModelSelect(option.value)}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="navbar-mobile-footer">
                        <div className="navbar-mobile-user">
                            <div className="navbar-avatar">
                                {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="navbar-user-details">
                                <span className="navbar-user-name">{user?.fullName || user?.username}</span>
                                <span className="navbar-user-role">{user?.role}</span>
                            </div>
                        </div>
                        <button className="navbar-mobile-logout" onClick={handleLogout}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
