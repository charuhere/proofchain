import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api.js";
import { supabase } from "../utils/supabase.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserSession(session);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session);
      } else {
        setUser(null);
        setLoading(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session) => {
    try {
      const { user } = session;
      const token = session.access_token;

      // Persist Supabase Token for API calls
      localStorage.setItem("token", token);

      // Sync with MongoDB Backend
      // This ensures we have a MongoDB User ID to attach to bills etc.
      await syncUserWithBackend(user, token);

      setLoading(false);
    } catch (err) {
      console.error("Session Sync Error:", err);
      setError("Failed to sync user session");
      // Optional: Force logout if sync fails?
      setLoading(false);
    }
  };

  const syncUserWithBackend = async (supabaseUser, token) => {
    try {
      // We send the Supabase User object to backend.
      // Backend will find or create the Mongo User.
      const response = await api.post('/auth/login', { user: supabaseUser });

      // Response contains the MongoDB user object
      const mongoUser = response;

      // Merge Supabase metadata with Mongo user data for frontend state
      const mergedUser = {
        ...mongoUser.user, // id (mongo), fullName, etc.
        email: supabaseUser.email,
        supabaseUid: supabaseUser.id
      };

      setUser(mergedUser);
      localStorage.setItem("user", JSON.stringify(mergedUser));
    } catch (err) {
      console.error("Backend Sync Failed:", err);
      throw err;
    }
  }

  const signup = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message || "Signup failed");
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);

      // Update local state
      const updatedUser = { ...user, ...response.user };

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
