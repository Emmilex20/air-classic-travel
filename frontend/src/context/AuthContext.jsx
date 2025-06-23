// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
// Import axios and toast if your login/register/logout functions make API calls directly here.
// Based on your provided functions, they currently don't, but typically they would.
// If you implement network calls here, remember to import:
// import axios from 'axios';
// import { toast } from 'react-toastify';
// const API_URL = import.meta.env.VITE_API_BASE_URL; // If using backend API for login/register

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
    user: null,
    token: null,
    loading: true, // <-- NEW: Add loading to the context shape
    login: () => {},
    logout: () => {},
    // register: () => {}, // Add register if you want to expose it via context
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // <-- NEW: Initialize loading state

    // Load from localStorage on initial render
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('userToken');
            const storedUser = localStorage.getItem('user'); // User data could include roles, etc.

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                console.log("AuthContext: Loaded user and token from localStorage.");
            } else {
                console.log("AuthContext: No user or token found in localStorage.");
            }
        } catch (error) {
            console.error("AuthContext: Failed to parse data from localStorage:", error);
            // Clear corrupted data if parsing fails
            localStorage.removeItem('userToken');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false); // <-- NEW: Set loading to false after localStorage check
            console.log("AuthContext: Finished loading initial auth status.");
        }
    }, []); // Empty dependency array means this runs once on mount

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('userToken', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("AuthContext: User logged in, token and user data set.");
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        console.log("AuthContext: User logged out, localStorage cleared.");
    };

    // If you have a register function in your context, ensure it updates state and local storage similarly
    // const register = (newToken, userData) => { ... };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}> {/* <-- NEW: Provide loading */}
            {children}
        </AuthContext.Provider>
    );
};