import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import { login, register, logout } from "../services/auth.api.js";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Guard clause: helps debug if Provider is missing
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // CORRECT: Now everything is defined and returned properly
  return { user, loading, handleLogin, handleRegister, handleLogout };
};