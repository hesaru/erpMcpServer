import ActivityTile from '../components/ActivityTile'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'
import { FilePlus, BarChart3, Users, Heart, Settings, CalendarDays } from 'lucide-react'

// Import tile images
import createTaskImg from '../images/create_task.png'
import backlogImg from '../images/backlog_management.png'
import employeeImg from '../images/employee_management.png'
import wellbeingImg from '../images/employee_wellbeing.png'
import leaveImg from '../images/leave_management.png'
import adminImg from '../images/admin_panel.png'

const Dashboard = () => {
    const { user } = useAuth()

    const allActivities = [
        {
            title: 'Create New Task',
            description: 'Start a new backlog item, assign priority, and set initial estimates for your project.',
            icon: <FilePlus size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
            path: '/edit-backlog',
            roles: ['ADMIN', 'MANAGER'],
            image: createTaskImg
        },
        {
            title: 'Backlog Management',
            description: 'Organize and prioritize your entire project backlog with intelligent sorting and sprint planning tools.',
            icon: <BarChart3 size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)',
            path: '/backlog-management',
            roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
            image: backlogImg
        },
        {
            title: 'Employee Management',
            description: 'Manage your team members, track roles, and oversee organizational structure.',
            icon: <Users size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
            path: '/employee-management',
            roles: ['ADMIN', 'MANAGER'],
            image: employeeImg
        },
        {
            title: 'Employee Well Being',
            description: 'Monitor team wellness, workload balance, and mental health indicators to maintain a healthy work environment.',
            icon: <Heart size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
            path: '/employee-wellbeing',
            roles: ['ADMIN', 'MANAGER'],
            image: wellbeingImg
        },
        {
            title: 'Leave Management',
            description: 'Apply for leave, track your requests, and manage team leave approvals.',
            icon: <CalendarDays size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            path: '/leave-management',
            roles: ['MANAGER', 'EMPLOYEE'],
            image: leaveImg
        },
        {
            title: 'Admin Panel',
            description: 'Create user accounts, manage system settings, and oversee the entire platform.',
            icon: <Settings size={24} strokeWidth={1.8} />,
            gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            path: '/admin',
            roles: ['ADMIN'],
            image: adminImg
        }
    ]

    // Filter activities based on user role
    const activities = allActivities.filter(a => a.roles.includes(user?.role))

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
                            image={activity.image}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
