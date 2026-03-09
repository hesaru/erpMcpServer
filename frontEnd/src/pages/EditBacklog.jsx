import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import backlogApi from '../services/backlogApi'
import aiApi from '../services/aiApi'
import './PageLayout.css'
import './EditBacklog.css'

const EditBacklog = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const taskId = searchParams.get('id')
    const isEditMode = !!taskId

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const [employees, setEmployees] = useState([])
    const [employeesLoading, setEmployeesLoading] = useState(true)

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1)
    const [aiSuggestions, setAiSuggestions] = useState([])
    const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false)
    const [aiSuggestionsError, setAiSuggestionsError] = useState(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: '',
        storyPoints: '',
        dueDate: '',
        source: 'MANUAL'
    })

    const [errors, setErrors] = useState({})

    // Load task data if in edit mode
    useEffect(() => {
        const init = async () => {
            await fetchEmployees()
            if (isEditMode) {
                await loadTask()
            } else {
                setLoading(false)
            }
        }
        init()
    }, [taskId])

    const fetchEmployees = async () => {
        try {
            setEmployeesLoading(true)
            const data = await import('../services/employeeApi').then(module => module.default.getAllEmployees())
            setEmployees(data)
        } catch (err) {
            console.error("Failed to load employees", err)
        } finally {
            setEmployeesLoading(false)
        }
    }

    const loadTask = async () => {
        try {
            setLoading(true)
            setError(null)
            const task = await backlogApi.getTaskById(taskId)

            // Format the date for the datetime-local input
            let formattedDate = ''
            if (task.dueDate) {
                const date = new Date(task.dueDate)
                formattedDate = date.toISOString().slice(0, 16)
            }

            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'TODO',
                priority: task.priority || 'MEDIUM',
                assignee: task.assignee ? task.assignee.id : '',
                storyPoints: task.storyPoints || '',
                dueDate: formattedDate,
                source: task.source || 'MANUAL'
            })
        } catch (err) {
            setError('Failed to load task. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required'
        }

        if (formData.storyPoints && (isNaN(formData.storyPoints) || formData.storyPoints < 0)) {
            newErrors.storyPoints = 'Story points must be a positive number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Only submit if we're on step 2 or in edit mode
        if (!isEditMode && currentStep === 1) {
            handleNextStep(e)
            return
        }

        if (!validateForm()) {
            return
        }

        try {
            setSaving(true)
            setError(null)

            // Prepare the data for submission
            const submitData = {
                ...formData,
                storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : 0,
                dueDate: formData.dueDate || null,
                assignee: formData.assignee ? { id: formData.assignee } : null
            }

            if (isEditMode) {
                await backlogApi.updateTask(taskId, submitData)
            } else {
                await backlogApi.createTask(submitData)
            }

            // Navigate back to backlog management
            navigate('/backlog-management')
        } catch (err) {
            setError(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`)
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        navigate('/backlog-management')
    }

    const fetchAiSuggestions = async () => {
        try {
            setLoadingAiSuggestions(true)
            setAiSuggestionsError(null)

            // Build meaningful message from form data
            const message = `Task: ${formData.title}. Description: ${formData.description}. Priority: ${formData.priority}. ${formData.dueDate ? `Due: ${new Date(formData.dueDate).toLocaleDateString()}` : ''}`

            const suggestions = await aiApi.getSuitableAssignees(message)
            setAiSuggestions(suggestions)
        } catch (err) {
            console.error('Failed to fetch AI suggestions:', err)
            setAiSuggestionsError('Failed to load AI suggestions. Please try manual selection.')
        } finally {
            setLoadingAiSuggestions(false)
        }
    }

    const handleNextStep = (e) => {
        e?.preventDefault() // Prevent form submission

        // Validate step 1 fields
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required'
        }

        if (formData.storyPoints && (isNaN(formData.storyPoints) || formData.storyPoints < 0)) {
            newErrors.storyPoints = 'Story points must be a positive number'
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length === 0) {
            setCurrentStep(2)
            // Automatically fetch AI suggestions when moving to step 2
            if (!isEditMode) {
                fetchAiSuggestions()
            }
        }
    }

    const handlePreviousStep = () => {
        setCurrentStep(1)
        setAiSuggestions([])
        setAiSuggestionsError(null)
    }

    const handleSelectAiSuggestion = (suggestion) => {
        // Find the employee by username (asignee field)
        const employee = employees.find(emp => emp.userName === suggestion.assignee)
        if (employee) {
            setFormData(prev => ({
                ...prev,
                assignee: employee.id
            }))
        }
    }

    if (loading) {
        return (
            <div className="page-layout">
                <div className="container">
                    <div className="loading-state glass">
                        <div className="spinner"></div>
                        <p>Loading task...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-layout">
            <div className="container">
                <button className="back-button" onClick={handleCancel}>
                    ← Back to Backlog
                </button>

                <div className="page-header fade-in">
                    <div className="page-icon">📝</div>
                    <h1>{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
                    <p className="page-description">
                        {isEditMode
                            ? 'Update task details and track progress'
                            : 'Add a new task to your backlog'}
                    </p>
                </div>

                <div className="form-container glass">
                    {error && (
                        <div className="error-banner">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="task-form">
                        {/* Step 1: Task Details (or all fields in edit mode) */}
                        {(currentStep === 1 || isEditMode) && (
                            <>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="title">
                                            Task Title <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter task title..."
                                            className={errors.title ? 'error' : ''}
                                        />
                                        {errors.title && <span className="error-message">{errors.title}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="description">
                                            Description <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe the task in detail..."
                                            rows="5"
                                            className={errors.description ? 'error' : ''}
                                        />
                                        {errors.description && <span className="error-message">{errors.description}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="priority">Priority</label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Show assignee in edit mode */}
                                {isEditMode && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="assignee">Assignee</label>
                                            <select
                                                id="assignee"
                                                name="assignee"
                                                value={formData.assignee}
                                                onChange={handleChange}
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.firstName} {emp.lastName} (@{emp.userName})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="storyPoints">Story Points</label>
                                            <input
                                                type="number"
                                                id="storyPoints"
                                                name="storyPoints"
                                                value={formData.storyPoints}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                className={errors.storyPoints ? 'error' : ''}
                                            />
                                            {errors.storyPoints && <span className="error-message">{errors.storyPoints}</span>}
                                        </div>
                                    </div>
                                )}

                                {/* Story points for create mode (step 1) */}
                                {!isEditMode && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="storyPoints">Story Points</label>
                                            <input
                                                type="number"
                                                id="storyPoints"
                                                name="storyPoints"
                                                value={formData.storyPoints}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                className={errors.storyPoints ? 'error' : ''}
                                            />
                                            {errors.storyPoints && <span className="error-message">{errors.storyPoints}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="dueDate">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                id="dueDate"
                                                name="dueDate"
                                                value={formData.dueDate}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEditMode && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="dueDate">Due Date</label>
                                            <input
                                                type="datetime-local"
                                                id="dueDate"
                                                name="dueDate"
                                                value={formData.dueDate}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="source">Source</label>
                                            <select
                                                id="source"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleChange}
                                            >
                                                <option value="MANUAL">Manual</option>
                                                <option value="JIRA">Jira</option>
                                                <option value="GITHUB">GitHub</option>
                                                <option value="EMAIL">Email</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {!isEditMode && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="source">Source</label>
                                            <select
                                                id="source"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleChange}
                                            >
                                                <option value="MANUAL">Manual</option>
                                                <option value="JIRA">Jira</option>
                                                <option value="GITHUB">GitHub</option>
                                                <option value="EMAIL">Email</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2: Assignee Selection (create mode only) */}
                        {currentStep === 2 && !isEditMode && (
                            <>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label>🤖 AI Assignee Suggestions</label>
                                        {loadingAiSuggestions ? (
                                            <div className="suggestions-loading">
                                                <div className="spinner"></div>
                                                <p>Analyzing task and finding suitable assignees...</p>
                                            </div>
                                        ) : aiSuggestionsError ? (
                                            <div className="error-banner">
                                                <span className="error-icon">⚠️</span>
                                                {aiSuggestionsError}
                                            </div>
                                        ) : aiSuggestions.length > 0 ? (
                                            <div className="suggestions-list">
                                                {aiSuggestions.map((suggestion, index) => (
                                                    <div
                                                        key={index}
                                                        className={`suggestion-card ${formData.assignee === employees.find(e => e.userName === suggestion.assignee)?.id ? 'selected' : ''}`}
                                                    >
                                                        <div className="suggestion-header">
                                                            <h3>@{suggestion.assignee}</h3>
                                                            <button
                                                                type="button"
                                                                className="select-button"
                                                                onClick={() => handleSelectAiSuggestion(suggestion)}
                                                            >
                                                                {formData.assignee === employees.find(e => e.userName === suggestion.assignee)?.id ? '✓ Selected' : 'Select'}
                                                            </button>
                                                        </div>
                                                        <div className="suggestion-details">
                                                            <div className="detail-item">
                                                                <strong>💡 Reason:</strong>
                                                                <p>{suggestion.reason}</p>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>📊 Past History:</strong>
                                                                <p>{suggestion.pastHistory}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="suggestions-empty">
                                                <span className="empty-icon">🤷</span>
                                                <p>Click "Get AI Suggestions" to see recommendations</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="assignee">Or Choose Manually</label>
                                        <div className="assignee-input-group">
                                            <select
                                                id="assignee"
                                                name="assignee"
                                                value={formData.assignee}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select an assignee...</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.firstName} {emp.lastName} (@{emp.userName})
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="ai-suggestion-button"
                                                onClick={fetchAiSuggestions}
                                                disabled={loadingAiSuggestions}
                                            >
                                                {loadingAiSuggestions ? (
                                                    <>
                                                        <div className="button-spinner"></div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        🤖 Get AI Suggestions
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {formData.assignee && (
                                    <div className="form-row">
                                        <div className="form-group full-width">
                                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                                                ✓ Selected: {employees.find(e => e.id === formData.assignee)?.firstName} {employees.find(e => e.id === formData.assignee)?.lastName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="form-actions">
                            {currentStep === 2 && !isEditMode && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handlePreviousStep}
                                    disabled={saving}
                                >
                                    ← Back
                                </button>
                            )}
                            {currentStep === 1 && !isEditMode && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}
                            {isEditMode && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            )}

                            {currentStep === 1 && !isEditMode ? (
                                <button
                                    type="button"
                                    className="submit-button"
                                    onClick={handleNextStep}
                                >
                                    Next: Choose Assignee →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="button-spinner"></div>
                                            {isEditMode ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Task' : 'Create Task'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditBacklog
