// frontend/src/components/ProtectedAdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // CORRECTED: Standard relative path
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const ProtectedAdminRoute = () => {
    const { user, loading } = useContext(AuthContext); // Get user and loading state from context

    if (loading) {
        // Still loading authentication status, don't render children yet
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100">
                <Spinner size="lg" color="indigo" />
                <p className="text-xl text-gray-600 mt-4 animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    // If user is logged in AND has the 'admin' role, render the Outlet (the protected component)
    if (user && user.roles.includes('admin')) {
        return <Outlet />;
    } else {
        // If not authenticated or not admin, redirect to home and show a toast message
        toast.error('Access Denied: Administrators only.');
        return <Navigate to="/" replace />;
    }
};

export default ProtectedAdminRoute;