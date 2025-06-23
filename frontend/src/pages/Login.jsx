// frontend/src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation to Register
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify'; // Import toast for notifications

// Import icons from lucide-react for input fields and button
import { Mail, Lock, LogIn, Plane } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Get the login function from AuthContext

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        // Clear error when user starts typing again
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/users/login`, {
                email,
                password,
            });

            if (response.data && response.data.token) {
                const { token, ...userData } = response.data;
                login(token, userData); // Call login from AuthContext to set user state globally
                toast.success(`Welcome back, ${userData.username}!`); // Use toast for success
                navigate('/'); // Redirect to home or dashboard after successful login
            } else {
                toast.error('Login failed: No token received.');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Login failed. Please check your credentials and try again.';
            toast.error(errorMsg); // Use toast for errors
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Left Section: Image & Marketing */}
                <div 
                    className="md:w-1/2 bg-cover bg-center hidden md:flex items-center justify-center p-8 relative"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542307137-b9c1d0a5f9f6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black opacity-70"></div>
                    <div className="relative z-10 text-center text-white p-6 animate-fade-in">
                        <Plane size={80} className="text-indigo-300 mx-auto mb-4 drop-shadow-md" />
                        <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">Welcome Aboard!</h2>
                        <p className="text-lg font-light leading-relaxed">
                            Log in to manage your flights, view your bookings, and unlock exclusive travel offers.
                        </p>
                    </div>
                </div>

                {/* Right Section: Login Form */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
                        Sign In to Your Account
                    </h2>
                    
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Email Input */}
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
                                    onChange={onChange}
                                    required
                                    placeholder="Email address"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    placeholder="Password"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password (Optional - for future functionality) */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-900">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Submit Button */}
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
                                    Logging in...
                                </span>
                            ) : (
                                <>
                                    <LogIn size={20} className="mr-2" />
                                    Login
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;