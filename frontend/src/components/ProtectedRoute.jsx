// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Path relative to ProtectedRoute.jsx
import { toast } from 'react-toastify';

/**
 * A private route component that checks for user authentication and roles.
 * Renders child routes if authorized, otherwise redirects to login or home.
 * @param {Array} allowedRoles - An array of roles that are allowed to access this route.
 */
const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext); // Get user object and loading status from AuthContext

    // If authentication status is still loading, show a loading message
    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Checking authorization...</p>
            </div>
        );
    }

    // If user is authenticated
    if (user) {
        // Check if user has any of the allowed roles
        const hasPermission = allowedRoles.some(role => user.roles.includes(role));

        if (hasPermission) {
            return <Outlet />; // User has permission, render the nested routes
        } else {
            // User is logged in but does not have the required role
            toast.error('Access Denied: You do not have the necessary permissions.');
            return <Navigate to="/" replace />; // Redirect to home page
        }
    } else {
        // User is not authenticated, redirect to login page
        toast.error('You must be logged in to view this page.');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;