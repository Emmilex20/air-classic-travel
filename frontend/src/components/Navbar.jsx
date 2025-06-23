// frontend/src/components/Navbar.jsx
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import icons from lucide-react
import {
    Plane,          // For Flights
    Building,       // For Hotels
    Ticket,         // For My Bookings
    LogIn,          // For Login
    UserPlus,       // For Register
    LogOut,         // For Logout
    LayoutDashboard, // For Dashboard
    Menu,           // Mobile menu icon (hamburger)
    X,              // Mobile menu icon (close)
    ChevronDown,    // Dropdown arrow (down)
    ChevronUp,      // Dropdown arrow (up)
    Newspaper,      // For Blog dropdown
    Info,           // For About dropdown
    Briefcase,      // For Careers dropdown
    Mail,           // For Contact Us
    Search,         // Example for Blog category
    BookOpen,       // Example for Blog category
    FileText,       // For Terms and Privacy links
    HelpCircle      // For FAQ link
} from 'lucide-react';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false);
    const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
    const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(false);

    // Ref for the navbar element to detect outside clicks
    const navbarRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
        setIsMenuOpen(false); // Close mobile menu on logout
    };

    const isAdmin = user && user.roles.includes('admin');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // Close all dropdowns when opening/closing main menu
        setIsBlogDropdownOpen(false);
        setIsAboutDropdownOpen(false);
        setIsCareersDropdownOpen(false);
    };

    // Function to close the main mobile menu and all dropdowns
    const closeAllNavElements = () => {
        setIsMenuOpen(false);
        setIsBlogDropdownOpen(false);
        setIsAboutDropdownOpen(false);
        setIsCareersDropdownOpen(false);
    };

    // Handle dropdown toggles, preventing event propagation for outside click detection
    const handleDropdownToggle = (setter, state) => (e) => {
        e.stopPropagation(); // Prevent click from bubbling up to document
        setter(!state);
        // Close other dropdowns if one is opened
        if (setter !== setIsBlogDropdownOpen) setIsBlogDropdownOpen(false);
        if (setter !== setIsAboutDropdownOpen) setIsAboutDropdownOpen(false);
        if (setter !== setIsCareersDropdownOpen) setIsCareersDropdownOpen(false);
    };

    // Effect to handle clicks outside the navbar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target)) {
                if (isMenuOpen || isBlogDropdownOpen || isAboutDropdownOpen || isCareersDropdownOpen) {
                    closeAllNavElements();
                }
            }
        };

        // Add event listener when component mounts
        document.addEventListener("mousedown", handleClickOutside);
        // Clean up the event listener when component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, isBlogDropdownOpen, isAboutDropdownOpen, isCareersDropdownOpen]); // Re-run effect if menu/dropdown states change

    return (
        <nav ref={navbarRef} className="bg-gradient-to-r from-indigo-700 to-purple-800 p-4 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
                {/* Brand/Logo and Mobile Menu Toggle */}
                <div className="flex justify-between items-center w-full md:w-auto">
                    <Link to="/" className="flex items-center text-2xl font-extrabold text-white group transform transition-transform duration-300 hover:scale-105" onClick={closeAllNavElements}>
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

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 p-2 rounded-md"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Navigation Links - Conditional Rendering for Mobile */}
                <div className={`${isMenuOpen ? 'flex' : 'hidden'} flex-col md:flex md:flex-row md:items-center w-full md:w-auto mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-4 transition-all duration-300 ease-in-out`}>
                    <NavLink to="/flights" icon={<Plane size={18} />} onClick={closeAllNavElements}>
                        Flights
                    </NavLink>
                    <NavLink to="/hotels" icon={<Building size={18} />} onClick={closeAllNavElements}>
                        Hotels
                    </NavLink>

                    {/* Blog Dropdown */}
                    <DropdownNavLink
                        title="Blog"
                        icon={<Newspaper size={18} />}
                        isOpen={isBlogDropdownOpen}
                        toggle={handleDropdownToggle(setIsBlogDropdownOpen, isBlogDropdownOpen)}
                        onLinkClick={closeAllNavElements} // Close all nav elements on link click
                    >
                        <NavLink to="/blog" icon={<BookOpen size={18} />}>Blog Home</NavLink>
                        <NavLink to="/blog/categories" icon={<Search size={18} />}>Categories</NavLink>
                    </DropdownNavLink>

                    {/* About Dropdown */}
                    <DropdownNavLink
                        title="About"
                        icon={<Info size={18} />}
                        isOpen={isAboutDropdownOpen}
                        toggle={handleDropdownToggle(setIsAboutDropdownOpen, isAboutDropdownOpen)}
                        onLinkClick={closeAllNavElements}
                    >
                        <NavLink to="/about" icon={<Info size={18} />}>About Us</NavLink>
                        <NavLink to="/terms" icon={<FileText size={18} />}>Terms</NavLink>
                        <NavLink to="/privacy" icon={<FileText size={18} />}>Privacy</NavLink>
                        <NavLink to="/faq" icon={<HelpCircle size={18} />}>FAQ</NavLink>
                    </DropdownNavLink>

                    {/* Careers Dropdown */}
                    <DropdownNavLink
                        title="Careers"
                        icon={<Briefcase size={18} />}
                        isOpen={isCareersDropdownOpen}
                        toggle={handleDropdownToggle(setIsCareersDropdownOpen, isCareersDropdownOpen)}
                        onLinkClick={closeAllNavElements}
                    >
                        <NavLink to="/careers" icon={<Briefcase size={18} />}>Job Openings</NavLink>
                        <NavLink to="/apply" icon={<UserPlus size={18} />}>Apply Now</NavLink>
                    </DropdownNavLink>

                    {/* Contact Link */}
                    <NavLink to="/contact" icon={<Mail size={18} />} onClick={closeAllNavElements}>
                        Contact
                    </NavLink>

                    {/* My Bookings link, visible to any logged-in user */}
                    {user && (
                        <NavLink to="/my-bookings" icon={<Ticket size={18} />} onClick={closeAllNavElements}>
                            My Bookings
                        </NavLink>
                    )}

                    {/* User Auth Links / Welcome & Dashboard/Logout */}
                    {!user ? (
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-indigo-600 pt-4 md:pt-0">
                            <NavLink to="/login" icon={<LogIn size={18} />} isButton onClick={closeAllNavElements}>
                                Login
                            </NavLink>
                            <NavLink to="/register" icon={<UserPlus size={18} />} isButton onClick={closeAllNavElements}>
                                Register
                            </NavLink>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto mt-4 md:mt-0 border-t md:border-t-0 border-indigo-600 pt-4 md:pt-0 items-center">
                            <span className="text-indigo-100 text-sm md:text-base hidden sm:block">
                                Welcome, <span className="font-semibold">{user.username}!</span>
                            </span>
                            {/* Dashboard link - only for admins */}
                            {isAdmin && (
                                <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} onClick={closeAllNavElements}>
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
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

// Custom NavLink component for consistent styling and icons
const NavLink = ({ to, icon, children, isButton = false, onClick }) => (
    <Link
        to={to}
        onClick={onClick} // Pass onClick handler
        className={`flex items-center space-x-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105
            ${isButton
                ? 'bg-white text-indigo-700 hover:bg-indigo-100 shadow-sm'
                : 'hover:text-indigo-200'
            } md:w-auto w-full justify-center md:justify-start
        `}
    >
        {icon}
        <span>{children}</span>
    </Link>
);

// New Dropdown NavLink Component
const DropdownNavLink = ({ title, icon, children, isOpen, toggle, onLinkClick }) => {
    // This ref helps close the dropdown when clicking outside
    const dropdownRef = useRef(null);

    // Effect to close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isOpen) {
                    toggle(); // Call the toggle function provided by parent (which will close the dropdown)
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, toggle]); // Depend on isOpen and toggle

    // Handle internal link clicks within the dropdown
    // eslint-disable-next-line no-unused-vars
    const handleInternalLinkClick = (e) => {
        // e.stopPropagation(); // Removed as closeAllNavElements now handles closing the dropdown
        if (onLinkClick) {
            onLinkClick(); // Propagates the click up to close the main mobile menu
        }
        // The `toggle()` from the parent's `handleDropdownToggle` will already close this dropdown
        // and closeAllNavElements also ensures this dropdown is closed.
    };

    return (
        <div className="relative group md:w-auto w-full" ref={dropdownRef}>
            <button
                onClick={toggle}
                className={`flex items-center space-x-1 rounded-full px-3 py-1.5 text-sm font-medium transition duration-150 ease-in-out transform hover:scale-105 hover:text-indigo-200 w-full justify-center md:justify-start
                    ${isOpen ? 'text-indigo-200' : ''}
                `}
                aria-expanded={isOpen}
            >
                {icon}
                <span>{title}</span>
                {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
            {isOpen && (
                <div
                    className="md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 mt-2 md:mt-3 bg-white text-gray-800 rounded-lg shadow-xl py-2 w-48 md:w-auto z-50 animate-fade-in-down origin-top-right md:origin-top"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    {/* Clone children to inject onClick handler */}
                    {React.Children.map(children, child =>
                        React.cloneElement(child, {
                            onClick: handleInternalLinkClick, // Use the new internal handler
                            className: `${child.props.className} block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left`
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default Navbar;