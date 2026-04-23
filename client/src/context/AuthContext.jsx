import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import getErrorMessage from "../api/getErrorMessage";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const rawUser = localStorage.getItem("library_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    localStorage.removeItem("library_user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  const persistAuth = (userData) => {
    localStorage.setItem("library_token", userData.token);
    localStorage.setItem("library_user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("library_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        const currentUser = {
          ...response.data.data,
          token
        };

        localStorage.setItem("library_user", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        console.error(getErrorMessage(error));
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    persistAuth(response.data.data);
    return response.data.data;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    persistAuth(response.data.data);
    return response.data.data;
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
