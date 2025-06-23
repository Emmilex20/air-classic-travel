// frontend/src/pages/FlightForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link for back button
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

// Import icons from lucide-react
import {
    PlaneTakeoff,        // Flight number
    Building2,      // Airline
    MapPin,         // Airports
    Calendar,       // Date/Time
    DollarSign,     // Price
    Users,          // Capacity/Seats
    Save,           // Save/Update button
    ArrowLeft       // Back button
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function FlightForm() {
    const { flightId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        flightNumber: '',
        airline: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        capacity: '',
        availableSeats: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Initial permission check for rendering the form
    useEffect(() => {
        if (!user || (!user.roles.includes('admin') && !user.roles.includes('airline_staff'))) {
            toast.error('You do not have permission to manage flights. Redirecting...');
            navigate('/flights');
        } else {
            setLoading(false); // Permissions checked, form can proceed loading data if in edit mode
        }
    }, [user, navigate]);

    // Fetch flight data if in edit mode
    useEffect(() => {
        if (flightId) {
            setIsEditMode(true);
            const fetchFlight = async () => {
                if (!token) {
                    toast.error('Authentication token missing. Please log in.');
                    navigate('/login');
                    return;
                }
                try {
                    setLoading(true);
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(`${API_URL}/flights/${flightId}`, config);

                    // Format dates to YYYY-MM-DDTHH:MM for datetime-local input
                    const departureTime = new Date(response.data.departureTime).toISOString().slice(0, 16);
                    const arrivalTime = new Date(response.data.arrivalTime).toISOString().slice(0, 16);

                    setFormData({
                        ...response.data,
                        departureTime,
                        arrivalTime,
                        price: response.data.price,
                        capacity: response.data.capacity,
                        availableSeats: response.data.availableSeats
                    });
                } catch (err) {
                    console.error('Error fetching flight for edit:', err);
                    const errorMsg = err.response?.data?.message || 'Failed to load flight for editing. Flight might not exist or you lack permission.';
                    toast.error(errorMsg);
                    setError(errorMsg);
                    navigate('/flights'); // Redirect on error
                } finally {
                    setLoading(false);
                }
            };
            fetchFlight();
        } else {
            // If not in edit mode, and permissions are already checked, stop loading
            if (user && (user.roles.includes('admin') || user.roles.includes('airline_staff'))) {
                 setLoading(false);
            }
           
        }
    }, [flightId, token, navigate, user]); // Added user to dependencies

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading for submission
        setError(''); // Clear previous errors

        if (!user || (!user.roles.includes('admin') && !user.roles.includes('airline_staff'))) {
            toast.error('You do not have permission to perform this action.');
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
            };

            if (!isEditMode) {
                payload.capacity = parseInt(formData.capacity, 10);
                // availableSeats will be set by the backend for new flights
            } else {
                if (formData.capacity !== '') {
                    payload.capacity = parseInt(formData.capacity, 10);
                }
                if (formData.availableSeats !== '') {
                    payload.availableSeats = parseInt(formData.availableSeats, 10);
                }
            }

            console.log('Sending flight data:', payload);

            if (isEditMode) {
                await axios.put(`${API_URL}/flights/${flightId}`, payload, config);
                toast.success('Flight updated successfully!');
            } else {
                await axios.post(`${API_URL}/flights`, payload, config);
                toast.success('Flight added successfully!');
            }
            navigate('/flights');
        } catch (err) {
            console.error('Error saving flight:', err);
            const errorMsg = err.response?.data?.message || 'Failed to save flight. Please check your input and try again.';
            setError(errorMsg); // Set error state for display
            toast.error(errorMsg);
        } finally {
            setLoading(false); // End loading regardless of success or failure
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <p className="text-xl text-gray-600 animate-pulse">Loading flight form...</p>
            </div>
        );
    }

    // Only render error if loading is false (meaning initial data fetch or permission check is done)
    if (error && !loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/flights" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Flight List
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down">
                {isEditMode ? 'Edit Flight Details' : 'Add New Flight'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto space-y-8 border border-indigo-200 transform transition-transform duration-300 hover:scale-[1.005]">
                <FormSection title="Flight Information">
                    <InputField label="Flight Number" id="flightNumber" name="flightNumber" type="text" value={formData.flightNumber} onChange={handleChange} required icon={PlaneTakeoff} placeholder="e.g., BA249" />
                    <InputField label="Airline" id="airline" name="airline" type="text" value={formData.airline} onChange={handleChange} required icon={Building2} placeholder="e.g., British Airways" />
                </FormSection>

                <FormSection title="Route Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Departure Airport (Code)" id="departureAirport" name="departureAirport" type="text" value={formData.departureAirport} onChange={handleChange} required icon={MapPin} placeholder="e.g., LHR" />
                        <InputField label="Arrival Airport (Code)" id="arrivalAirport" name="arrivalAirport" type="text" value={formData.arrivalAirport} onChange={handleChange} required icon={MapPin} placeholder="e.g., JFK" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Departure Time" id="departureTime" name="departureTime" type="datetime-local" value={formData.departureTime} onChange={handleChange} required icon={Calendar} />
                        <InputField label="Arrival Time" id="arrivalTime" name="arrivalTime" type="datetime-local" value={formData.arrivalTime} onChange={handleChange} required icon={Calendar} />
                    </div>
                </FormSection>

                <FormSection title="Pricing & Capacity">
                    <InputField label="Price (₦)" id="price" name="price" type="number" value={formData.price} onChange={handleChange} step="0.01" min="0" required icon={DollarSign} placeholder="e.g., 500.00" />

                    {!isEditMode ? (
                        // Show Capacity for adding new flights
                        <InputField label="Capacity (Total Seats)" id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} min="1" step="1" required icon={Users} placeholder="e.g., 200" />
                    ) : (
                        // Show both Capacity and Available Seats in edit mode
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Total Capacity" id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} min="1" step="1" required icon={Users} />
                            <InputField label="Available Seats" id="availableSeats" name="availableSeats" type="number" value={formData.availableSeats} onChange={handleChange} min="0" step="1" max={formData.capacity !== '' ? formData.capacity : undefined} required icon={Users} />
                        </div>
                    )}
                </FormSection>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                    disabled={loading} // Disable during submission
                >
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {isEditMode ? 'Updating...' : 'Adding...'}
                        </span>
                    ) : (
                        <>
                            <Save size={24} className="mr-3 group-hover:scale-110 transition-transform" />
                            {isEditMode ? 'Update Flight' : 'Add Flight'}
                        </>
                    )}
                </button>
            </form>

            {/* Back to Flights Button */}
            <div className="text-center mt-10">
                <Link to="/flights" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="mr-2" /> Back to All Flights
                </Link>
            </div>
        </div>
    );
}

// Reusable Input Field Component with Icon
const InputField = ({ label, id, name, type, value, onChange, placeholder, icon: Icon, required = false, step, min, max }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200"
            />
        </div>
    </div>
);

// Reusable Form Section Component
const FormSection = ({ title, children }) => (
    <div className="border-b border-gray-200 pb-6 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

export default FlightForm;