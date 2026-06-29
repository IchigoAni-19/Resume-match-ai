import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import "../auth.form.scss"

/**
 * Register page — creates a new user account with username, email, and password.
 * Redirects to home on success; shows an inline error on failure.
 */
const Register = () => {
    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await handleRegister({ username, email, password })
            navigate('/')
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed. Please try again.")
        }
    }

    if (loading) {
        return <main><h1>Loading...</h1></main>
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button className="button primary-button" type="submit">
                        Register
                    </button>
                </form>

                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </main>
    )
}

export default Register
