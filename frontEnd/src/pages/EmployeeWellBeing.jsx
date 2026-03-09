import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, Shield, Brain, BookOpen, TrendingUp } from 'lucide-react'
import './PageLayout.css'

const EmployeeWellBeing = () => {
    const navigate = useNavigate()

    const features = [
        { icon: <Activity size={18} />, text: 'Track team workload and stress levels' },
        { icon: <Shield size={18} />, text: 'Monitor wellness check-in responses' },
        { icon: <Brain size={18} />, text: 'View burnout risk indicators' },
        { icon: <BookOpen size={18} />, text: 'Access mental health resources' },
        { icon: <TrendingUp size={18} />, text: 'Generate well-being reports and insights' }
    ]

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">💚</div>
                    <h1>Employee Well Being</h1>
                    <p className="page-description">
                        Monitor team wellness, workload balance, and mental health indicators to maintain a healthy work environment.
                    </p>
                </div>

                <div className="page-content glass" style={{ maxWidth: '700px' }}>
                    <div className="placeholder-content">
                        <h2>Coming Soon</h2>
                        <p>This feature is currently under development. You'll be able to:</p>
                        <ul>
                            {features.map((feature, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: 'var(--purple-500)', flexShrink: 0 }}>{feature.icon}</span>
                                    {feature.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeWellBeing
