// frontend/src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation to Login
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify'; // Import toast for notifications

// Import icons from lucide-react for input fields and buttons
import {
    User,       // For username, first name, last name
    Mail,       // For email
    Lock,       // For password
    Phone,      // For phone
    MapPin,     // For street, city, state
    Home,       // For general address/zip
    Globe,      // For country
    UserPlus,   // For Register button
    Plane       // For the left section branding
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        },
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Get the login function from AuthContext

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData((prevData) => ({
                ...prevData,
                address: {
                    ...prevData.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
        // Clear error when user starts typing again
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/users/register`, formData);
            const { token, ...userData } = response.data;

            login(token, userData); // Call login from AuthContext to set user state globally
            toast.success(`Registration successful! Welcome, ${userData.username}!`); // Use toast for success
            navigate('/'); // Redirect to home after successful registration
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Registration failed. Please ensure all required fields are filled and try again.';
            toast.error(errorMsg); // Use toast for errors
        } finally {
            setLoading(false);
        }
    };

    // Helper for input fields with icons
    const InputField = ({ label, id, name, type, value, onChange, placeholder, icon: Icon, required = false, className = '' }) => (
        <div>
            <label htmlFor={id} className="sr-only">{label}</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {Icon && <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                </div>
                <input
                    type={type}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder || label}
                    className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ${className}`}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Left Section: Image & Marketing */}
                <div
                    className="md:w-1/2 bg-cover bg-center hidden md:flex items-center justify-center p-8 relative"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517400508104-e3621422a578?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 opacity-70"></div>
                    <div className="relative z-10 text-center text-white p-6 animate-fade-in">
                        <Plane size={80} className="text-purple-300 mx-auto mb-4 drop-shadow-md" />
                        <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">Create Your Account</h2>
                        <p className="text-lg font-light leading-relaxed">
                            Sign up today to manage your dream trips, track bookings, and get exclusive travel insights.
                        </p>
                    </div>
                </div>

                {/* Right Section: Registration Form */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
                        Join Air Classic Travel
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Information */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Account Details</h3>
                            <div className="space-y-4">
                                <InputField label="Username" id="username" name="username" type="text" value={formData.username} onChange={handleChange} required icon={User} />
                                <InputField label="Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Mail} />
                                <InputField label="Password" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required icon={Lock} />
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="First Name" id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} icon={User} />
                                <InputField label="Last Name" id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} icon={User} />
                                <InputField label="Phone" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} icon={Phone} className="sm:col-span-2" />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Address (Optional)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Street Address" id="address.street" name="address.street" type="text" value={formData.address.street} onChange={handleChange} icon={MapPin} className="sm:col-span-2" />
                                <InputField label="City" id="address.city" name="address.city" type="text" value={formData.address.city} onChange={handleChange} icon={MapPin} />
                                <InputField label="State/Province" id="address.state" name="address.state" type="text" value={formData.address.state} onChange={handleChange} icon={MapPin} />
                                <InputField label="Zip/Postal Code" id="address.zipCode" name="address.zipCode" type="text" value={formData.address.zipCode} onChange={handleChange} icon={Home} />
                                <InputField label="Country" id="address.country" name="address.country" type="text" value={formData.address.country} onChange={handleChange} icon={Globe} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </span>
                            ) : (
                                <>
                                    <UserPlus size={20} className="mr-2" />
                                    Register
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;