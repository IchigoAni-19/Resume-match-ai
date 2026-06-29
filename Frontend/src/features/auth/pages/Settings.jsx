import { useAuth } from '../hooks/useAuth.js'
import { useNavigate } from 'react-router'
import Header from '../../common/components/Header.jsx'
import './Settings.scss'

const Settings = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="settings-page">
            <Header />
            <div className="settings-content">
                <div className="settings-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>
                    <h1>Settings</h1>
                </div>

                <div className="settings-card">
                    <h2>Account</h2>
                    <div className="settings-row">
                        <span className="settings-label">Username</span>
                        <span className="settings-value">{user?.username}</span>
                    </div>
                    <div className="settings-row">
                        <span className="settings-label">Email</span>
                        <span className="settings-value">{user?.email}</span>
                    </div>
                </div>

                <div className="settings-card settings-card--muted">
                    <h2>More settings coming soon</h2>
                    <p>Profile editing, password change, and notification preferences will be available here.</p>
                </div>
            </div>
        </div>
    )
}

export default Settings
