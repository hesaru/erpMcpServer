import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import backlogApi from '../services/backlogApi'
import './PageLayout.css'
import './BacklogManagement.css'

const BacklogManagement = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [filterAssignee, setFilterAssignee] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [employees, setEmployees] = useState([])

    // Fetch employees on mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await import('../services/employeeApi').then(module => module.default.getAllEmployees())
                setEmployees(data)
            } catch (err) {
                console.error("Failed to load employees for filter", err)
            }
        }
        fetchEmployees()
    }, [])

    // Fetch tasks whenever status or assignee filters change
    useEffect(() => {
        fetchTasks()
    }, [filterStatus, filterAssignee])

    // Apply search filter locally whenever tasks or search query changes
    useEffect(() => {
        applySearchFilter()
    }, [tasks, searchQuery])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            setError(null)
            // Pass current filters to the API
            const filters = {
                status: filterStatus === 'ALL' ? null : filterStatus,
                assigneeId: filterAssignee || null
            }
            const data = await backlogApi.getAllTasks(filters)
            setTasks(data)
        } catch (err) {
            setError('Failed to load tasks. Please ensure the backend server is running.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const applySearchFilter = () => {
        let filtered = [...tasks]

        // Filter by search query (title or description) - Client side only
        if (searchQuery) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredTasks(filtered)
    }

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return
        }

        try {
            await backlogApi.deleteTask(id)
            setTasks(tasks.filter(task => task.id !== id))
        } catch (err) {
            alert('Failed to delete task')
            console.error(err)
        }
    }

    const handleEditTask = (id) => {
        navigate(`/edit-backlog?id=${id}`)
    }

    const getPriorityColor = (priority) => {
        const colors = {
            HIGH: '#ef4444',
            MEDIUM: '#f59e0b',
            LOW: '#10b981'
        }
        return colors[priority] || '#6b7280'
    }

    const getStatusColor = (status) => {
        const colors = {
            TODO: '#6b7280',
            IN_PROGRESS: '#3b82f6',
            DONE: '#10b981',
            BLOCKED: '#ef4444'
        }
        return colors[status] || '#6b7280'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">📊</div>
                    <h1>Backlog Management</h1>
                    <p className="page-description">
                        Organize and prioritize your entire project backlog
                    </p>
                </div>

                <div className="backlog-controls glass">
                    <div className="controls-row">
                        <input
                            type="text"
                            placeholder="🔍 Search tasks..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                            <option value="BLOCKED">Blocked</option>
                        </select>

                        <select
                            className="filter-select"
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                        >
                            <option value="">All Assignees</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </option>
                            ))}
                        </select>

                        <button
                            className="create-button"
                            onClick={() => navigate('/edit-backlog')}
                        >
                            + Create Task
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-label">Total Tasks:</span>
                            <span className="stat-value">{filteredTasks.length}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Story Points:</span>
                            <span className="stat-value">
                                {filteredTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    {loading ? (
                        <div className="loading-state glass">
                            <div className="spinner"></div>
                            <p>Loading tasks...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state glass">
                            <div className="error-icon">⚠️</div>
                            <h3>Error Loading Tasks</h3>
                            <p>{error}</p>
                            <button className="retry-button" onClick={fetchTasks}>
                                Retry
                            </button>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="empty-state glass">
                            <div className="empty-icon">📋</div>
                            <h3>No Tasks Found</h3>
                            <p>
                                {tasks.length === 0
                                    ? "Create your first backlog task to get started!"
                                    : "No tasks match your current filters."}
                            </p>
                            <button
                                className="create-button"
                                onClick={() => navigate('/edit-backlog')}
                            >
                                + Create Task
                            </button>
                        </div>
                    ) : (
                        <div className="tasks-grid">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="task-card glass fade-in">
                                    <div className="task-header">
                                        <h3 className="task-title">{task.title}</h3>
                                        <div className="task-actions">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEditTask(task.id)}
                                                title="Edit task"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteTask(task.id)}
                                                title="Delete task"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    <p className="task-description">{task.description}</p>

                                    <div className="task-meta">
                                        <div className="meta-row">
                                            <span
                                                className="badge status-badge"
                                                style={{ backgroundColor: getStatusColor(task.status) }}
                                            >
                                                {task.status?.replace('_', ' ')}
                                            </span>
                                            <span
                                                className="badge priority-badge"
                                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>

                                        <div className="meta-row">
                                            {task.assignee && (
                                                <span className="meta-item">
                                                    👤 {task.assignee.firstName} {task.assignee.lastName}
                                                </span>
                                            )}
                                            {task.storyPoints && (
                                                <span className="meta-item">
                                                    📊 {task.storyPoints} pts
                                                </span>
                                            )}
                                        </div>

                                        <div className="meta-row">
                                            <span className="meta-item date">
                                                📅 {formatDate(task.dueDate)}
                                            </span>
                                            {task.source && (
                                                <span className="meta-item source">
                                                    {task.source}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BacklogManagement
