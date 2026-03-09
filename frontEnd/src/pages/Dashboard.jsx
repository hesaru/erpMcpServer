import ActivityTile from '../components/ActivityTile'
import './Dashboard.css'
import { FilePlus, BarChart3, Users, Heart } from 'lucide-react'

const Dashboard = () => {
    const activities = [
        {
            title: 'Create New Task',
            description: 'Start a new backlog item, assign priority, and set initial estimates for your project.',
            icon: <FilePlus size={40} strokeWidth={1.5} />,
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', // Updated to match new primary
            path: '/edit-backlog'
        },
        {
            title: 'Backlog Management',
            description: 'Organize and prioritize your entire project backlog with intelligent sorting and sprint planning tools.',
            icon: <BarChart3 size={40} strokeWidth={1.5} />,
            gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            path: '/backlog-management'
        },
        {
            title: 'Employee Management',
            description: 'Manage employees and their details.',
            icon: <Users size={40} strokeWidth={1.5} />,
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            path: '/employee-management'
        },
        {
            title: 'Employee Well Being',
            description: 'Monitor team wellness, workload balance, and mental health indicators to maintain a healthy work environment.',
            icon: <Heart size={40} strokeWidth={1.5} />,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            path: '/employee-wellbeing'
        }
    ]

    return (
        <div className="dashboard">
            <div className="container">
                <header className="dashboard-header fade-in">
                    <h1>Project Backlog Management</h1>
                    <p className="dashboard-subtitle">
                        AI-powered tools to streamline your project management and team well-being
                    </p>
                </header>

                <div className="activities-grid">
                    {activities.map((activity, index) => (
                        <ActivityTile
                            key={index}
                            title={activity.title}
                            description={activity.description}
                            icon={activity.icon}
                            gradient={activity.gradient}
                            path={activity.path}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
