import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, register, logout } from "../services/auth.api.js";

/**
 * Hook that exposes auth state and actions.
 * Must be used inside an <AuthProvider>.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading } = context;

    /**
     * Logs in with email + password. Throws on failure so callers can show errors.
     * @param {{ email: string, password: string }} credentials
     */
    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
        } catch (err) {
            throw err; // re-throw so the page can show the error message
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registers a new user. Throws on failure so callers can show errors.
     * @param {{ username: string, email: string, password: string }} credentials
     */
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            setUser(data.user);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logs out the current user, clears user state, and invalidates the server-side token.
     */
    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (err) {
            // Swallow logout errors — user is still cleared locally
            console.error("Logout request failed:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, handleLogin, handleRegister, handleLogout };
};
