import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // If JSON parse fails, clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, fullName, confirmPassword) => {
    try {
      const response = await api.post("/auth/signup", {
        email,
        password,
        fullName,
        confirmPassword,
      });

      // FIX: Removed .data because api.js already unwrapped it
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "Signup failed");
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // FIX: Removed .data here too
      // Assuming your login endpoint returns { token: "...", user: { ... } }
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      return response;
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      
      // FIX: Removed .data. 
      // Merging existing user state with the response (assuming response contains updated fields)
      const updatedUser = { ...user, ...response }; 
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signup, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
