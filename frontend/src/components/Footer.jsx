// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for internal navigation
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    Send // For newsletter icon
} from 'lucide-react'; // Ensure lucide-react is installed

function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-900 to-indigo-900 text-gray-300 py-12 shadow-inner border-t border-indigo-700">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-8 mb-8">

                    {/* Column 1: Company Info */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="flex items-center text-3xl font-extrabold text-white mb-4 group transform transition-transform duration-300 hover:scale-105">
                            {/* Reusing the SVG logo from Navbar for consistency */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-10 h-10 mr-3 text-indigo-400 group-hover:text-white transition-colors duration-300"
                            >
                                <path d="M2.28 17.56L1.13 14a1 1 0 0 1 .46-1.3l.08-.04c.14-.07 1.4-.66 2.37-1.12.18-.08.35-.15.53-.22 2.72-1.04 4.58-1.57 6.43-1.6V8.12a1 1 0 0 1 .29-.71l3.52-3.53a1 1 0 0 1 1.42 0l1.77 1.76a1 1 0 0 1 0 1.41L15.8 9.71a1 1 0 0 1-.71.29H13.6c-.03 1.25-.09 2.53-.18 3.8-.08 1-.22 2-.4 2.94-.17.91-.38 1.8-.62 2.65-.24.8-.52 1.56-.84 2.27a.99.99 0 0 1-1.37.38l-4.22-2.12a1 1 0 0 1-.38-1.37zM17 10.59l2-2L16 5.59l-2 2zM6.55 16.27c.18-.58.33-1.22.45-1.9L9.4 11.83c.08-.1.14-.2.18-.3.2-.42.34-.87.41-1.34L11.5 9.17c.07-.47.1-1.03.11-1.63L11.72 7h.03a.5.5 0 0 0 .5-.5V5h-1.5a.5.5 0 0 0-.5.5v.03c-.6.01-1.16.04-1.63.11L7.84 6.8c-.47.07-.92.21-1.34.41-.1.04-.2.09-.3.18l-2.54 2.31c-.68.61-1.2 1.34-1.56 2.2V16.2c.16-.06.33-.12.5-.18a.99.99 0 0 1 .63-.09l1.62.27c.56.09 1.12.16 1.68.22 1.48.16 2.97.23 4.45.21l1.6-.02a.5.5 0 0 0 .47-.63c-.15-.49-.24-1-.3-1.52l-.08-.49z" />
                            </svg>
                            <span>Air Classic Travel</span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-xs leading-relaxed mt-2">
                            Your journey begins with us. We connect you to the world with seamless travel experiences and unparalleled service.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
                            <li><Link to="/flights" className="hover:text-white transition-colors duration-200">Book Flights</Link></li>
                            <li><Link to="/hotels" className="hover:text-white transition-colors duration-200">Book Hotels</Link></li>
                            <li><Link to="/blog" className="hover:text-white transition-colors duration-200">Our Blog</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors duration-200">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Contact Us</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact & Social */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
                        <div className="space-y-2">
                            <p className="flex items-center justify-center md:justify-start text-gray-400">
                                <MapPin size={18} className="mr-2 text-indigo-400" />
                                <span>123 Skyway, Global City, GC 1001</span>
                            </p>
                            <p className="flex items-center justify-center md:justify-start text-gray-400">
                                <Phone size={18} className="mr-2 text-indigo-400" />
                                <span>+1 (555) 123-4567</span>
                            </p>
                            <p className="flex items-center justify-center md:justify-start text-gray-400">
                                <Mail size={18} className="mr-2 text-indigo-400" />
                                <span>info@airclassictravel.com</span>
                            </p>
                        </div>
                        <div className="flex justify-center md:justify-start space-x-4 mt-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                                <Facebook size={24} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                                <Twitter size={24} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors duration-200">
                                <Instagram size={24} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors duration-200">
                                <Linkedin size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="flex flex-col items-center justify-center py-6 border-b border-gray-700 mb-8">
                    <h4 className="text-2xl font-bold text-white mb-4">Stay Updated with Our Newsletter</h4>
                    <p className="text-gray-400 text-center mb-6 max-w-lg">
                        Subscribe to get the latest flight deals, hotel offers, and travel news directly in your inbox!
                    </p>
                    <div className="flex flex-col sm:flex-row w-full max-w-md space-y-4 sm:space-y-0 sm:space-x-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-grow p-3 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        />
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-105 duration-200"
                        >
                            <Send size={20} className="mr-2" /> Subscribe
                        </button>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center text-xs text-gray-500 mt-4">
                    <p>&copy; {new Date().getFullYear()} Air Classic Travel. All rights reserved.</p>
                    <p className="mt-1">Handcrafted with <span className="text-red-500">&hearts;</span> for your global adventures.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;