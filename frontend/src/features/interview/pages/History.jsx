import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useInterview } from '../hooks/useInterview.js';
import Header from '../../common/components/Header.jsx';
import './History.scss';

const History = () => {
    const navigate = useNavigate();
    const { reports, getReports, loading } = useInterview();

    useEffect(() => {
        getReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#3fb950';
        if (score >= 60) return '#f5a623';
        return '#ff4d4d';
    };

    if (loading) {
        return (
            <div className="history-page">
                <Header />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <h1>Loading your interview history...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <Header />
            <div className="history-content">
                <div className="history-header">
                    <h1>Interview History</h1>
                    <p className="subtitle">Your generated interview preparation plans</p>
                </div>

                {reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h2>No interview plans yet</h2>
                        <p>Create your first interview preparation plan to get started</p>
                        <button
                            onClick={() => navigate('/')}
                            className="button primary-button"
                        >
                            Create New Plan
                        </button>
                    </div>
                ) : (
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <div
                                key={report._id}
                                className="report-card"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <div className="report-card-header">
                                    <div className="report-title">{report.title || 'Untitled Plan'}</div>
                                    <div
                                        className="match-score-badge"
                                        style={{ borderColor: getScoreColor(report.matchScore) }}
                                    >
                                        <span
                                            className="score-value"
                                            style={{ color: getScoreColor(report.matchScore) }}
                                        >
                                            {report.matchScore}%
                                        </span>
                                    </div>
                                </div>
                                <div className="report-date">{formatDate(report.createdAt)}</div>
                                <div className="report-preview">
                                    {report.skillGaps && report.skillGaps.slice(0, 3).map((gap, i) => (
                                        <span key={i} className="skill-tag">
                                            {gap.skill}
                                        </span>
                                    ))}
                                    {report.skillGaps && report.skillGaps.length > 3 && (
                                        <span className="more-skills">+{report.skillGaps.length - 3} more</span>
                                    )}
                                </div>
                                <button className="view-button">View Details →</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
