import { useNavigate } from 'react-router-dom'
import './PageLayout.css'

const EmployeeWellBeing = () => {
    const navigate = useNavigate()

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">💚</div>
                    <h1>Employee Well Being</h1>
                    <p className="page-description">
                        Monitor team wellness, workload balance, and mental health indicators to maintain a healthy work environment.
                    </p>
                </div>

                <div className="page-content glass">
                    <div className="placeholder-content">
                        <h2>Coming Soon</h2>
                        <p>This feature is currently under development. You'll be able to:</p>
                        <ul>
                            <li>Track team workload and stress levels</li>
                            <li>Monitor wellness check-in responses</li>
                            <li>View burnout risk indicators</li>
                            <li>Access mental health resources</li>
                            <li>Generate well-being reports and insights</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeWellBeing
