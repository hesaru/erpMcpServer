import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, Activity, CalendarDays, CheckCircle2,
    AlertCircle, Briefcase, Github, ShieldAlert, CheckSquare,
    RefreshCw, Search, User, AlertTriangle, Brain, X, ChevronDown
} from 'lucide-react';
import wellbeingApi from '../services/wellbeingApi';
import { useModel } from '../context/ModelContext';
import './PageLayout.css';
import './EmployeeWellBeing.css';

const EmployeeWellBeing = () => {
    const navigate = useNavigate();
    const { selectedModel } = useModel();

    // Top 3 at-risk state
    const [topAtRisk, setTopAtRisk] = useState([]);
    const [topLoading, setTopLoading] = useState(true);
    const [topError, setTopError] = useState(null);

    // All employees list for search
    const [allEmployees, setAllEmployees] = useState([]);

    // Search & selected employee state
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedLoading, setSelectedLoading] = useState(false);
    const [selectedError, setSelectedError] = useState(null);

    const searchRef = useRef(null);

    // Fetch top 3 at-risk employees and employee list on mount
    const fetchTopAtRisk = async () => {
        setTopLoading(true);
        setTopError(null);
        try {
            // Fetch raw data for employee list (search dropdown)
            const rawData = await wellbeingApi.getDashboardData();
            setAllEmployees(rawData || []);

            // Fetch AI-analyzed top 3
            const top3 = await wellbeingApi.getTopAtRiskEmployees(selectedModel);
            setTopAtRisk(top3);
        } catch (err) {
            console.error("Failed to load top at-risk data", err);
            setTopError("Unable to analyze employee stress data. Please try again.");
        } finally {
            setTopLoading(false);
        }
    };

    useEffect(() => {
        fetchTopAtRisk();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter employees for search
    const filteredEmployees = allEmployees.filter(emp =>
        emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Handle employee selection
    const handleSelectEmployee = async (employee) => {
        setSearchQuery(employee.employeeName);
        setShowDropdown(false);
        setSelectedEmployee(null);
        setSelectedLoading(true);
        setSelectedError(null);

        try {
            const analyzed = await wellbeingApi.getEmployeeAnalysis(employee.employeeId, selectedModel);
            if (analyzed) {
                setSelectedEmployee(analyzed);
            } else {
                setSelectedError("Could not find data for this employee.");
            }
        } catch (err) {
            console.error("Failed to analyze employee", err);
            setSelectedError("AI analysis failed. Please try again.");
        } finally {
            setSelectedLoading(false);
        }
    };

    const clearSelection = () => {
        setSearchQuery('');
        setSelectedEmployee(null);
        setSelectedError(null);
        setShowDropdown(false);
    };

    // Helper functions
    const getStressLevelDetails = (level) => {
        switch (level) {
            case 'LOW': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 size={16} />, label: 'Low Stress' };
            case 'MEDIUM': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Activity size={16} />, label: 'Moderate' };
            case 'HIGH': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <AlertTriangle size={16} />, label: 'High Risk' };
            case 'CRITICAL': return { color: '#dc2626', bg: 'rgba(220,38,38,0.15)', icon: <ShieldAlert size={16} />, label: 'Critical' };
            default: return { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: <Activity size={16} />, label: 'Pending' };
        }
    };

    const getStressBarColor = (score) => {
        if (score >= 75) return '#dc2626';
        if (score >= 50) return '#ef4444';
        if (score >= 30) return '#f59e0b';
        return '#10b981';
    };

    const getRankBadge = (index) => {
        const badges = ['🔴', '🟠', '🟡'];
        return badges[index] || '⚪';
    };

    return (
        <div className="page-layout wellbeing-page">
            <div className="container">
                <div className="wellbeing-header-row">
                    <button className="back-button" onClick={() => navigate('/')}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <button className="refresh-button" onClick={fetchTopAtRisk} disabled={topLoading}>
                        <RefreshCw size={16} className={topLoading ? 'spin' : ''} />
                    </button>
                </div>

                <div className="page-header fade-in">
                    <div className="page-icon wellbeing-icon">💚</div>
                    <h1>Employee Well Being</h1>
                    <p className="page-description">
                        AI-powered stress analysis — monitor team workload and identify employees who need support.
                    </p>
                </div>

                {/* ─── SECTION 1: Needs Attention (Top 3) ─── */}
                <div className="wb-section fade-in">
                    <div className="wb-section-header">
                        <div className="wb-section-title">
                            <ShieldAlert size={20} />
                            <h2>Needs Attention</h2>
                        </div>
                        <span className="wb-section-subtitle">AI-identified top 3 employees at risk of stress</span>
                    </div>

                    {topLoading ? (
                        <div className="wb-section-loading">
                            <div className="wb-ai-pulse">
                                <Brain size={28} />
                            </div>
                            <p>AI is analyzing employee workload data...</p>
                        </div>
                    ) : topError ? (
                        <div className="wb-section-error">
                            <AlertCircle size={24} />
                            <p>{topError}</p>
                            <button className="btn btn-primary btn-sm" onClick={fetchTopAtRisk}>Retry</button>
                        </div>
                    ) : topAtRisk.length === 0 ? (
                        <div className="wb-section-empty">
                            <CheckCircle2 size={32} color="#10b981" />
                            <p>All employees appear to have healthy workloads! 🎉</p>
                        </div>
                    ) : (
                        <div className="wb-attention-grid">
                            {topAtRisk.map((employee, index) => {
                                const stress = getStressLevelDetails(employee.stressLevel);

                                return (
                                    <div
                                        key={employee.employeeId}
                                        className={`wb-attention-card wb-attention-rank-${index + 1}`}
                                        style={{ animationDelay: `${index * 0.15}s` }}
                                    >
                                        <div className="wb-attention-rank">
                                            <span className="wb-rank-badge">{getRankBadge(index)}</span>
                                            <span className="wb-rank-num">#{index + 1}</span>
                                        </div>

                                        <div className="wb-attention-info">
                                            <div className="wb-attention-name-row">
                                                <h3>{employee.employeeName}</h3>
                                                <div
                                                    className="wb-stress-pill"
                                                    style={{ backgroundColor: stress.bg, color: stress.color }}
                                                >
                                                    {stress.icon}
                                                    <span>{employee.stressScore}/100</span>
                                                </div>
                                            </div>
                                            <span className="wb-attention-position">{employee.position || 'Team Member'}</span>
                                        </div>

                                        <div className="wb-attention-bar">
                                            <div className="wb-attention-bar-track">
                                                <div
                                                    className="wb-attention-bar-fill"
                                                    style={{
                                                        width: `${employee.stressScore}%`,
                                                        backgroundColor: getStressBarColor(employee.stressScore)
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {employee.aiReasoning && (
                                            <div className="wb-attention-reason">
                                                <Brain size={13} />
                                                <span>{employee.aiReasoning}</span>
                                            </div>
                                        )}

                                        <div className="wb-attention-stats">
                                            <div className="wb-mini-stat">
                                                <Briefcase size={12} />
                                                <span>{employee.jiraOpenCount} Jira Open</span>
                                            </div>
                                            <div className="wb-mini-stat">
                                                <CheckSquare size={12} />
                                                <span>{employee.taskInProgressCount + employee.taskTodoCount} Tasks Active</span>
                                            </div>
                                            <div className="wb-mini-stat">
                                                <CalendarDays size={12} />
                                                <span>{employee.approvedLeaves} Leaves</span>
                                            </div>
                                            <div className="wb-mini-stat">
                                                <Github size={12} />
                                                <span>{employee.gitCommitCount} Commits</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── SECTION 2: Employee Lookup ─── */}
                <div className="wb-section wb-lookup-section fade-in">
                    <div className="wb-section-header">
                        <div className="wb-section-title">
                            <Search size={20} />
                            <h2>Employee Stress Lookup</h2>
                        </div>
                        <span className="wb-section-subtitle">Search and select an employee for detailed AI stress analysis</span>
                    </div>

                    <div className="wb-search-container" ref={searchRef}>
                        <div className="wb-search-input-wrapper">
                            <Search size={18} className="wb-search-icon" />
                            <input
                                type="text"
                                className="wb-search-input"
                                placeholder="Search by name or position..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                            />
                            {searchQuery && (
                                <button className="wb-search-clear" onClick={clearSelection}>
                                    <X size={16} />
                                </button>
                            )}
                            <ChevronDown size={16} className="wb-search-chevron" />
                        </div>

                        {showDropdown && (
                            <div className="wb-search-dropdown">
                                {filteredEmployees.length === 0 ? (
                                    <div className="wb-dropdown-empty">
                                        <User size={16} />
                                        <span>No employees found</span>
                                    </div>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <button
                                            key={emp.employeeId}
                                            className="wb-dropdown-item"
                                            onClick={() => handleSelectEmployee(emp)}
                                        >
                                            <div className="wb-dropdown-avatar">
                                                <User size={16} />
                                            </div>
                                            <div className="wb-dropdown-info">
                                                <span className="wb-dropdown-name">{emp.employeeName}</span>
                                                <span className="wb-dropdown-pos">{emp.position || 'Team Member'}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Employee Detail */}
                    {selectedLoading && (
                        <div className="wb-detail-loading">
                            <div className="wb-ai-pulse">
                                <Brain size={24} />
                            </div>
                            <p>AI is analyzing this employee's stress level...</p>
                        </div>
                    )}

                    {selectedError && (
                        <div className="wb-detail-error">
                            <AlertCircle size={20} />
                            <p>{selectedError}</p>
                        </div>
                    )}

                    {selectedEmployee && !selectedLoading && (
                        <div className="wb-detail-panel fade-in">
                            <div className="wb-detail-header">
                                <div className="wb-detail-identity">
                                    <div className="wb-detail-avatar">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <h3>{selectedEmployee.employeeName}</h3>
                                        <span className="wb-detail-position">{selectedEmployee.position || 'Team Member'}</span>
                                    </div>
                                </div>
                                <div
                                    className="wb-detail-stress-badge"
                                    style={{
                                        backgroundColor: getStressLevelDetails(selectedEmployee.stressLevel).bg,
                                        color: getStressLevelDetails(selectedEmployee.stressLevel).color,
                                        borderColor: `${getStressLevelDetails(selectedEmployee.stressLevel).color}30`
                                    }}
                                >
                                    {getStressLevelDetails(selectedEmployee.stressLevel).icon}
                                    <span>{getStressLevelDetails(selectedEmployee.stressLevel).label}</span>
                                    <span className="wb-detail-score">{selectedEmployee.stressScore}/100</span>
                                </div>
                            </div>

                            {/* Stress bar */}
                            <div className="wb-detail-stress-bar">
                                <div className="wb-detail-bar-labels">
                                    <span>Stress Index</span>
                                    <span style={{ color: getStressBarColor(selectedEmployee.stressScore), fontWeight: 700 }}>
                                        {selectedEmployee.stressScore} / 100
                                    </span>
                                </div>
                                <div className="wb-detail-bar-track">
                                    <div
                                        className="wb-detail-bar-fill"
                                        style={{
                                            width: `${selectedEmployee.stressScore}%`,
                                            backgroundColor: getStressBarColor(selectedEmployee.stressScore)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* AI Reasoning */}
                            {selectedEmployee.aiReasoning && (
                                <div className="wb-detail-ai-insight">
                                    <div className="wb-ai-insight-header">
                                        <Brain size={16} />
                                        <span>AI Analysis</span>
                                    </div>
                                    <p>{selectedEmployee.aiReasoning}</p>
                                </div>
                            )}

                            {/* Metrics Grid */}
                            <div className="wb-detail-metrics">
                                <div className="wb-detail-metric-card">
                                    <div className="wb-detail-metric-icon leaves-icon">
                                        <CalendarDays size={18} />
                                    </div>
                                    <div className="wb-detail-metric-title">Leave Requests</div>
                                    <div className="wb-detail-metric-grid">
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val">{selectedEmployee.totalLeaves}</span>
                                            <span className="wb-detail-metric-lbl">Total</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#10b981' }}>{selectedEmployee.approvedLeaves}</span>
                                            <span className="wb-detail-metric-lbl">Approved</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#f59e0b' }}>{selectedEmployee.pendingLeaves}</span>
                                            <span className="wb-detail-metric-lbl">Pending</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#ef4444' }}>{selectedEmployee.declinedLeaves}</span>
                                            <span className="wb-detail-metric-lbl">Declined</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="wb-detail-metric-card">
                                    <div className="wb-detail-metric-icon jira-icon">
                                        <Briefcase size={18} />
                                    </div>
                                    <div className="wb-detail-metric-title">Jira Workload</div>
                                    <div className="wb-detail-metric-grid">
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val">{selectedEmployee.jiraIssueCount}</span>
                                            <span className="wb-detail-metric-lbl">Total Issues</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={selectedEmployee.jiraOpenCount > 5 ? { color: '#ef4444' } : {}}>{selectedEmployee.jiraOpenCount}</span>
                                            <span className="wb-detail-metric-lbl">Open</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="wb-detail-metric-card">
                                    <div className="wb-detail-metric-icon github-icon">
                                        <Github size={18} />
                                    </div>
                                    <div className="wb-detail-metric-title">GitHub Activity</div>
                                    <div className="wb-detail-metric-grid">
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val wb-detail-metric-large">{selectedEmployee.gitCommitCount}</span>
                                            <span className="wb-detail-metric-lbl">Total Commits</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="wb-detail-metric-card">
                                    <div className="wb-detail-metric-icon tasks-icon">
                                        <CheckSquare size={18} />
                                    </div>
                                    <div className="wb-detail-metric-title">Backlog Tasks</div>
                                    <div className="wb-detail-metric-grid">
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val">{selectedEmployee.taskCount}</span>
                                            <span className="wb-detail-metric-lbl">Total</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#6366f1' }}>{selectedEmployee.taskTodoCount}</span>
                                            <span className="wb-detail-metric-lbl">TODO</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#f59e0b' }}>{selectedEmployee.taskInProgressCount}</span>
                                            <span className="wb-detail-metric-lbl">In Progress</span>
                                        </div>
                                        <div className="wb-detail-metric-item">
                                            <span className="wb-detail-metric-val" style={{ color: '#10b981' }}>{selectedEmployee.taskDoneCount}</span>
                                            <span className="wb-detail-metric-lbl">Done</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedEmployee && !selectedLoading && !selectedError && (
                        <div className="wb-lookup-placeholder">
                            <Search size={36} color="var(--purple-300)" />
                            <p>Select an employee above to see their detailed stress analysis</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeWellBeing;
