// frontend/src/pages/Dashboard.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Import icons for dashboard links
import {
    Plane,          // For flights
    Building,       // For hotels
    PlusCircle,     // For add new items
    Users,          // For user management (general)
    LayoutDashboard, // Main dashboard icon for title
    Settings,       // For system settings
    Edit,           // For manage flights/hotels (more specific than just Plane/Building)
    UserCog,        // For user management settings
    ClipboardList   // NEW/UPDATED ICON: For All Bookings
} from 'lucide-react';

function Dashboard() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if user is not an admin or not logged in
    useEffect(() => {
        // Only proceed if authLoading is false, meaning user data is available
        if (!authLoading) {
            if (!user || !user.roles.includes('admin')) {
                toast.error('Access Denied: You must be an administrator to view this page.');
                navigate('/'); // Redirect to home or another appropriate page
            }
        }
    }, [user, authLoading, navigate]);

    // Show loading state while authentication status is being determined
    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <p className="text-xl text-gray-600 animate-pulse">Loading dashboard permissions...</p>
            </div>
        );
    }

    // After authLoading is false, if user is not admin, they would have been redirected by useEffect above.
    // So, if we reach here, user is confirmed to be an admin.
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center animate-fade-in-down flex items-center justify-center">
                <LayoutDashboard size={48} className="mr-4 text-indigo-600" /> Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Card for Add Flight */}
                <DashboardCard
                    to="/flights/new"
                    icon={<PlusCircle size={48} className="text-blue-600" />}
                    title="Add New Flight"
                    description="Create and add new flight schedules to the system."
                />

                {/* Card for Manage Flights */}
                <DashboardCard
                    to="/flights"
                    icon={<Plane size={48} className="text-purple-600" />}
                    title="Manage Flights"
                    description="View, edit, or delete existing flight schedules."
                />

                {/* Card for Add Hotel */}
                <DashboardCard
                    to="/hotels/new"
                    icon={<PlusCircle size={48} className="text-green-600" />}
                    title="Add New Hotel"
                    description="Register new hotel properties for booking."
                />

                {/* Card for Manage Hotels */}
                <DashboardCard
                    to="/hotels"
                    icon={<Building size={48} className="text-teal-600" />}
                    title="Manage Hotels"
                    description="View, edit, or delete existing hotel listings."
                />

                {/* Card for User Management */}
                <DashboardCard
                    to="/admin/users" 
                    icon={<UserCog size={48} className="text-orange-600" />}
                    title="User Management"
                    description="Manage user accounts, roles, and permissions."
                />

                {/* Card for All Bookings - NOW ENABLED */}
                <DashboardCard
                    to="/admin/bookings" 
                    icon={<ClipboardList size={48} className="text-red-600" />} // Changed icon to ClipboardList
                    title="All Bookings"
                    description="Overview of all flight and hotel bookings."
                    // disabled={true} // REMOVED: This is now enabled
                />

                {/* Placeholder for System Settings */}
                <DashboardCard
                    to="/admin/settings"
                    icon={<Settings size={48} className="text-gray-600" />}
                    title="System Settings"
                    description="Configure application-wide settings and preferences."
                    disabled={true} 
                />

                 {/* Placeholder for Analytics */}
                 <DashboardCard
                    to="/admin/analytics" 
                    icon={<LayoutDashboard size={48} className="text-yellow-600" />}
                    title="Analytics & Reports"
                    description="View system performance and booking trends."
                    disabled={true} 
                />
            </div>
        </div>
    );
}

// Reusable Card component for Dashboard links
const DashboardCard = ({ to, icon, title, description, disabled = false }) => {
    const commonClasses = "bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center transition-all duration-300";
    const enabledClasses = "cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-300";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    return (
        <Link 
            to={disabled ? "#" : to} 
            className={`${commonClasses} ${disabled ? disabledClasses : enabledClasses}`} 
            onClick={(e) => disabled && e.preventDefault()}
        >
            <div className="mb-5 p-3 bg-gray-50 rounded-full shadow-inner">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
            {disabled && (
                <span className="mt-auto inline-block text-sm font-bold text-red-600 bg-red-100 px-4 py-2 rounded-full border border-red-300 animate-pulse-slow">
                    Coming Soon
                </span>
            )}
        </Link>
    );
};

export default Dashboard;