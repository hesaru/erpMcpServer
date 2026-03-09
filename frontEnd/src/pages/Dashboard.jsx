import ActivityTile from '../components/ActivityTile'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'
import { FilePlus, BarChart3, Users, Heart, Settings, CalendarDays, LogOut, User } from 'lucide-react'

const Dashboard = () => {
    const { user, logout, isAdmin, isManager, isEmployee } = useAuth()

    const allActivities = [
        {
            title: 'Create New Task',
            description: 'Start a new backlog item, assign priority, and set initial estimates for your project.',
            icon: <FilePlus size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
            path: '/edit-backlog',
            roles: ['ADMIN', 'MANAGER']
        },
        {
            title: 'Backlog Management',
            description: 'Organize and prioritize your entire project backlog with intelligent sorting and sprint planning tools.',
            icon: <BarChart3 size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)',
            path: '/backlog-management',
            roles: ['ADMIN', 'MANAGER', 'EMPLOYEE']
        },
        {
            title: 'Employee Management',
            description: 'Manage your team members, track roles, and oversee organizational structure.',
            icon: <Users size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
            path: '/employee-management',
            roles: ['ADMIN', 'MANAGER']
        },
        {
            title: 'Employee Well Being',
            description: 'Monitor team wellness, workload balance, and mental health indicators to maintain a healthy work environment.',
            icon: <Heart size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
            path: '/employee-wellbeing',
            roles: ['ADMIN', 'MANAGER']
        },
        {
            title: 'Leave Management',
            description: 'Apply for leave, track your requests, and manage team leave approvals.',
            icon: <CalendarDays size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            path: '/leave-management',
            roles: ['MANAGER', 'EMPLOYEE']
        },
        {
            title: 'Admin Panel',
            description: 'Create user accounts, manage system settings, and oversee the entire platform.',
            icon: <Settings size={28} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            path: '/admin',
            roles: ['ADMIN']
        }
    ]

    // Filter activities based on user role
    const activities = allActivities.filter(a => a.roles.includes(user?.role))

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <div className="dashboard">
            <div className="container">
                {/* Top Bar */}
                <div className="dashboard-topbar fade-in">
                    <div className="topbar-user">
                        <div className="topbar-avatar">
                            <User size={18} strokeWidth={2} />
                        </div>
                        <div className="topbar-info">
                            <span className="topbar-name">{user?.fullName || user?.username}</span>
                            <span className="topbar-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="topbar-logout" onClick={handleLogout}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

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
