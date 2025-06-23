// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Send } from 'lucide-react'; // Icons

const API_URL = import.meta.env.VITE_API_BASE_URL;

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Note: The backend is designed to return a generic success message
            // even if the email is not found, to prevent email enumeration attacks.
            const response = await axios.post(`${API_URL}/users/forgotpassword`, { email });
            setMessage(response.data.message || 'If a user with that email exists, a password reset email has been sent.');
            toast.success(response.data.message || 'Password reset link sent! Check your email.');
            setEmail(''); // Clear the email field
        } catch (err) {
            console.error('Forgot password error:', err);
            const errorMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to send password reset email. Please try again.';
            toast.error(errorMsg);
            setMessage(''); // Clear any success message if an error occurs
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Left Section: Image & Branding */}
                <div 
                    className="md:w-1/2 bg-cover bg-center hidden md:flex items-center justify-center p-6 relative"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510414902-8f96e4804364?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-blue-900 opacity-70"></div>
                    <div className="relative z-10 text-center text-white p-4">
                        <Mail size={80} className="text-indigo-300 mx-auto mb-4 drop-shadow-md" />
                        <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">Password Reset</h2>
                        <p className="text-md font-light leading-relaxed">
                            Enter your email to receive instructions on resetting your password.
                        </p>
                    </div>
                </div>

                {/* Right Section: Forgot Password Form */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-900">
                        Forgot Your Password?
                    </h2>
                    <p className="text-center text-gray-600 mb-6">
                        No worries, we'll send you a reset link.
                    </p>
                    
                    {message && <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">{message}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email address"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                <>
                                    <Send size={20} className="mr-2" />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Remembered your password?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;