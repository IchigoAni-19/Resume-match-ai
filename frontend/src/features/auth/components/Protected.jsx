import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";

/**
 * Route guard that redirects unauthenticated users to /login.
 * Shows a minimal loading state while the auth check is in flight.
 */
const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <h1 style={{ color: "var(--text-secondary)", fontWeight: 400, fontSize: "1.1rem" }}>Loading...</h1>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
