import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import leaveApi from '../services/leaveApi'
import {
    ArrowLeft, CalendarPlus, CalendarDays, ClipboardList, CheckCircle2,
    XCircle, AlertCircle, Calendar, Inbox
} from 'lucide-react'
import './LeaveManagement.css'

const LeaveManagement = () => {
    const navigate = useNavigate()
    const { user, isManager, isEmployee } = useAuth()

    const [activeTab, setActiveTab] = useState(isManager() ? 'pending' : 'apply')
    const [leaves, setLeaves] = useState([])
    const [loading, setLoading] = useState(false)

    // Apply form state
    const [reason, setReason] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)

    useEffect(() => {
        loadLeaves()
    }, [activeTab])

    const loadLeaves = async () => {
        setLoading(true)
        try {
            let data = []
            if (activeTab === 'pending' && isManager()) {
                data = await leaveApi.getPendingLeaves()
            } else if (activeTab === 'my-requests') {
                data = await leaveApi.getMyLeaveRequests()
            } else if (activeTab === 'all' && isManager()) {
                data = await leaveApi.getAllLeavesForManager()
            }
            setLeaves(data)
        } catch (err) {
            console.error('Failed to load leaves:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleApplyLeave = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitLoading(true)

        try {
            await leaveApi.applyLeave({
                reason,
                startDate,
                endDate,
            })
            setSuccess('Leave request submitted successfully!')
            setReason('')
            setStartDate('')
            setEndDate('')
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to submit leave request'
            setError(msg)
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleApprove = async (id) => {
        try {
            await leaveApi.approveLeave(id)
            loadLeaves()
        } catch (err) {
            console.error('Failed to approve:', err)
        }
    }

    const handleDecline = async (id) => {
        try {
            await leaveApi.declineLeave(id)
            loadLeaves()
        } catch (err) {
            console.error('Failed to decline:', err)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="leave-page">
            <div className="container">
                <header className="leave-header">
                    <button className="leave-back-btn" onClick={() => navigate('/')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Leave Management</h1>
                        <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>
                            {isManager()
                                ? 'Manage team leave requests and apply for your own'
                                : 'Apply for leave and track your requests'}
                        </p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="leave-tabs">
                    {(isEmployee() || isManager()) && (
                        <button
                            className={`leave-tab ${activeTab === 'apply' ? 'active' : ''}`}
                            onClick={() => setActiveTab('apply')}
                        >
                            <CalendarPlus size={16} />
                            Apply Leave
                        </button>
                    )}
                    {(isEmployee() || isManager()) && (
                        <button
                            className={`leave-tab ${activeTab === 'my-requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my-requests')}
                        >
                            <CalendarDays size={16} />
                            My Requests
                        </button>
                    )}
                    {isManager() && (
                        <button
                            className={`leave-tab ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            <ClipboardList size={16} />
                            Pending Requests
                        </button>
                    )}
                    {isManager() && (
                        <button
                            className={`leave-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            <Inbox size={16} />
                            All Requests
                        </button>
                    )}
                </div>

                {/* Apply Leave Form */}
                {activeTab === 'apply' && (
                    <div className="leave-section">
                        <h2>
                            <CalendarPlus size={22} />
                            Apply for Leave
                        </h2>

                        {error && (
                            <div className="login-error" style={{ marginBottom: 'var(--space-4)' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="leave-success">{success}</div>
                        )}

                        <form className="leave-form" onSubmit={handleApplyLeave}>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Reason</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe the reason for your leave request..."
                                    required
                                />
                            </div>

                            <button type="submit" className="leave-submit-btn" disabled={submitLoading}>
                                {submitLoading ? 'Submitting...' : 'Submit Leave Request'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Leave Lists */}
                {activeTab !== 'apply' && (
                    <div className="leave-section">
                        <h2>
                            {activeTab === 'pending' && <><ClipboardList size={22} /> Pending Requests</>}
                            {activeTab === 'my-requests' && <><CalendarDays size={22} /> My Leave Requests</>}
                            {activeTab === 'all' && <><Inbox size={22} /> All Requests</>}
                        </h2>

                        {loading ? (
                            <div className="empty-state">
                                <p className="pulse">Loading...</p>
                            </div>
                        ) : leaves.length === 0 ? (
                            <div className="empty-state">
                                <Inbox size={48} />
                                <h3>No leave requests found</h3>
                                <p>
                                    {activeTab === 'pending'
                                        ? 'There are no pending leave requests to review.'
                                        : 'You haven\'t submitted any leave requests yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="leave-list">
                                {leaves.map((leave, index) => (
                                    <div
                                        className="leave-card"
                                        key={leave.id}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="leave-card-header">
                                            <span className="leave-card-employee">
                                                {leave.employee
                                                    ? `${leave.employee.firstName} ${leave.employee.lastName}`
                                                    : 'Unknown Employee'}
                                            </span>
                                            <span className={`leave-status-badge ${leave.status.toLowerCase()}`}>
                                                {leave.status}
                                            </span>
                                        </div>

                                        <div className="leave-card-dates">
                                            <span>
                                                <Calendar size={14} />
                                                From: {formatDate(leave.startDate)}
                                            </span>
                                            <span>
                                                <Calendar size={14} />
                                                To: {formatDate(leave.endDate)}
                                            </span>
                                        </div>

                                        <div className="leave-card-reason">
                                            {leave.reason}
                                        </div>

                                        {activeTab === 'pending' && isManager() && leave.status === 'PENDING' && (
                                            <div className="leave-card-actions">
                                                <button
                                                    className="action-btn approve"
                                                    onClick={() => handleApprove(leave.id)}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    className="action-btn decline"
                                                    onClick={() => handleDecline(leave.id)}
                                                >
                                                    <XCircle size={16} />
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeaveManagement
