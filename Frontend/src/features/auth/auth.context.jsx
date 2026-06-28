import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api.js"; // Ensure this path is correct

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // START AS TRUE

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null); // Explicitly set user to null on failure
      } finally {
        setLoading(false); // This will run whether the request succeeds or fails
      }
    };
    getAndSetUser();
  }, []); // Runs once on component mount

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
