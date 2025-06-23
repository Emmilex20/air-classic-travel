// frontend/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // CORRECTED: Changed import path to go up one level and into 'context'

// Import icons from lucide-react
import {
    Plane,        // For Flights
    Building,     // For Hotels
    Ticket,       // For My Bookings
    PlusCircle,   // For Add Flight/Hotel (though these links will be removed from navbar directly)
    LogIn,        // For Login
    UserPlus,     // For Register
    LogOut,       // For Logout
    LayoutDashboard // For Dashboard
} from 'lucide-react'; // Ensure you have lucide-react installed: pnpm add lucide-react

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    // Helper function to check if user has the required role for flight management
    // This helper is no longer directly used for navbar links but kept for potential future use or other components
    // const hasFlightManagementPermission = user && (user.roles.includes('admin') || user.roles.includes('airline_staff'));
    // Helper function to check if user has the required role for hotel management
    // const hasHotelManagementPermission = user && user.roles.includes('admin');

    // Helper function to check if user is an admin for the Dashboard link
    const isAdmin = user && user.roles.includes('admin');

    return (
        <nav className="bg-gradient-to-r from-indigo-700 to-purple-800 p-4 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
                {/* Brand/Logo */}
                <Link to="/" className="flex items-center text-2xl font-extrabold text-white group transform transition-transform duration-300 hover:scale-105 mb-4 md:mb-0">
                    {/* SVG Logo - A simple plane icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-8 h-8 mr-2 text-indigo-200 group-hover:text-white transition-colors duration-300"
                    >
                        <path d="M2.28 17.56L1.13 14a1 1 0 0 1 .46-1.3l.08-.04c.14-.07 1.4-.66 2.37-1.12.18-.08.35-.15.53-.22 2.72-1.04 4.58-1.57 6.43-1.6V8.12a1 1 0 0 1 .29-.71l3.52-3.53a1 1 0 0 1 1.42 0l1.77 1.76a1 1 0 0 1 0 1.41L15.8 9.71a1 1 0 0 1-.71.29H13.6c-.03 1.25-.09 2.53-.18 3.8-.08 1-.22 2-.4 2.94-.17.91-.38 1.8-.62 2.65-.24.8-.52 1.56-.84 2.27a.99.99 0 0 1-1.37.38l-4.22-2.12a1 1 0 0 1-.38-1.37zM17 10.59l2-2L16 5.59l-2 2zM6.55 16.27c.18-.58.33-1.22.45-1.9L9.4 11.83c.08-.1.14-.2.18-.3.2-.42.34-.87.41-1.34L11.5 9.17c.07-.47.1-1.03.11-1.63L11.72 7h.03a.5.5 0 0 0 .5-.5V5h-1.5a.5.5 0 0 0-.5.5v.03c-.6.01-1.16.04-1.63.11L7.84 6.8c-.47.07-.92.21-1.34.41-.1.04-.2.09-.3.18l-2.54 2.31c-.68.61-1.2 1.34-1.56 2.2V16.2c.16-.06.33-.12.5-.18a.99.99 0 0 1 .63-.09l1.62.27c.56.09 1.12.16 1.68.22 1.48.16 2.97.23 4.45.21l1.6-.02a.5.5 0 0 0 .47-.63c-.15-.49-.24-1-.3-1.52l-.08-.49z" />
                    </svg>
                    <span>Air Classic Travel</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center md:justify-end items-center space-x-3 sm:space-x-4">
                    {/* Flights Link */}
                    <NavLink to="/flights" icon={<Plane size={18} />}>
                        Flights
                    </NavLink>

                    {/* REMOVED: Conditionally render "Add Flight" link */}
                    {/* {hasFlightManagementPermission && (
                        <NavLink to="/flights/new" icon={<PlusCircle size={18} />} isButton>
                            Add Flight
                        </NavLink>
                    )} */}

                    {/* Hotels Link */}
                    <NavLink to="/hotels" icon={<Building size={18} />}>
                        Hotels
                    </NavLink>

                    {/* REMOVED: Conditionally render "Add Hotel" link */}
                    {/* {hasHotelManagementPermission && (
                        <NavLink to="/hotels/new" icon={<PlusCircle size={18} />} isButton>
                            Add Hotel
                        </NavLink>
                    )} */}
                    
                    {/* My Bookings link, visible to any logged-in user */}
                    {user && (
                        <NavLink to="/my-bookings" icon={<Ticket size={18} />}>
                            My Bookings
                        </NavLink>
                    )}

                    {/* User Auth Links / Welcome & Dashboard/Logout */}
                    {!user ? (
                        <>
                            <NavLink to="/login" icon={<LogIn size={18} />}>
                                Login
                            </NavLink>
                            <NavLink to="/register" icon={<UserPlus size={18} />}>
                                Register
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <span className="text-indigo-100 text-sm md:text-base hidden sm:block">
                                Welcome, <span className="font-semibold">{user.username}!</span>
                            </span>
                            {/* Dashboard link - only for admins */}
                            {isAdmin && (
                                <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />}>
                                    Dashboard
                                </NavLink>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-full text-sm shadow-md transition duration-150 ease-in-out transform hover:scale-105"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

// Custom NavLink component for consistent styling and icons
const NavLink = ({ to, icon, children, isButton = false }) => (
    <Link
        to={to}
        className={`flex items-center space-x-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105
            ${isButton 
                ? 'bg-white text-indigo-700 hover:bg-indigo-100 shadow-sm' 
                : 'hover:text-indigo-200'
            }`}
    >
        {icon}
        <span>{children}</span>
    </Link>
);

export default Navbar;