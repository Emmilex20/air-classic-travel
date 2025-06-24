// frontend/src/pages/HotelForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// Import icons from lucide-react
import {
    Hotel,        // General hotel icon for heading
    Building,     // Hotel name
    MapPin,       // Location, address
    Info,         // Description
    Sparkles,     // Amenities
    Star,         // Star rating
    DollarSign,   // Price per night
    BedDouble,    // Available rooms
    Image,        // Image URLs
    Save,         // Save/Update button
    ArrowLeft     // Back button
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for currency formatting (consistent with HotelList & FlightDetails)
// eslint-disable-next-line no-unused-vars
const formatCurrency = (amount) => {
    // We format for display, the actual value in input field remains raw number string
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN', // Using NGN for Naira symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


function HotelForm() {
    const { hotelId } = useParams(); // For edit mode
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext); // Get token and user for roles

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        description: '',
        amenities: '', // Will be a comma-separated string for input
        starRating: '',
        pricePerNight: '',
        availableRooms: '',
        images: '', // Will be a comma-separated string for input
    });
    const [loading, setLoading] = useState(true); // For initial data fetch (edit mode) or permission check
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission

    // --- Permission Check on Component Mount ---
    useEffect(() => {
        if (!user || !user.roles.includes('admin')) {
            toast.error('You do not have permission to manage hotels. Redirecting...');
            navigate('/hotels'); // Redirect to hotel list
            return;
        }
        setLoading(false); // Authentication check passed, stop initial loading for this purpose
    }, [user, navigate]);

    // --- Fetch Hotel Data for Edit Mode ---
    useEffect(() => {
        if (hotelId) { // Only run if hotelId is present (i.e., in edit mode)
            setIsEditMode(true);
            const fetchHotel = async () => {
                if (!token) { // Ensure token is available before making API call
                    toast.error('Authentication token missing. Please log in.');
                    navigate('/login');
                    return;
                }
                try {
                    setLoading(true); // Start loading for data fetch
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const response = await axios.get(`${API_URL}/hotels/${hotelId}`, config);
                    
                    setFormData({
                        ...response.data,
                        amenities: response.data.amenities ? response.data.amenities.join(', ') : '', // Convert array to string for input
                        images: response.data.images ? response.data.images.join(', ') : '',      // Convert array to string for input
                        // Ensure numbers are set as actual numbers for input fields expecting number type
                        starRating: response.data.starRating,
                        pricePerNight: response.data.pricePerNight,
                        availableRooms: response.data.availableRooms,
                    });
                } catch (err) {
                    console.error('Error fetching hotel for edit:', err);
                    const errorMsg = err.response?.data?.message || 'Failed to load hotel for editing. Hotel might not exist or you lack permission.';
                    toast.error(errorMsg);
                    setError(errorMsg);
                    navigate('/hotels'); // Redirect back to hotel list on error
                } finally {
                    setLoading(false); // Stop loading after data fetch attempt
                }
            };
            fetchHotel();
        } else {
            // If not in edit mode (new hotel), set loading to false immediately as no data fetch is needed
            // Only if user permissions are already confirmed
            if (user && (user.roles.includes('admin'))) {
                setLoading(false);
            }
        }
    }, [hotelId, token, navigate, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Start submission loading
        setError(''); // Clear previous errors

        // Client-side role check before API call for security and UX
        if (!user || !user.roles.includes('admin')) {
            toast.error('You do not have permission to perform this action.');
            setIsSubmitting(false);
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            // Prepare payload: convert comma-separated strings to arrays, parse numbers
            const payload = {
                ...formData,
                amenities: formData.amenities ? formData.amenities.split(',').map(s => s.trim()).filter(s => s) : [],
                images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(s => s) : [],
                // Ensure numerical fields are parsed correctly. Number() handles empty strings as 0 or NaN,
                // and correctly converts numeric strings to numbers.
                starRating: Number(formData.starRating),
                pricePerNight: Number(formData.pricePerNight),
                availableRooms: Number(formData.availableRooms),
            };

            console.log('Sending hotel data:', payload);

            if (isEditMode) {
                await axios.put(`${API_URL}/hotels/${hotelId}`, payload, config);
                toast.success('Hotel updated successfully!');
            } else {
                await axios.post(`${API_URL}/hotels`, payload, config);
                toast.success('Hotel added successfully!');
            }
            navigate('/hotels'); // Redirect to hotel list after successful operation
        } catch (err) {
            console.error('Error saving hotel:', err);
            const errorMsg = err.response?.data?.message || 'Failed to save hotel. Please check your input and try again.';
            setError(errorMsg); // Set error state for display
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false); // End submission loading
        }
    };

    // --- Loading and Error States for initial render ---
    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Spinner size="lg" color="indigo" />
                <p className="text-xl text-gray-600 animate-pulse">Loading hotel form...</p>
            </div>
        );
    }

    if (error && !loading) { // Only show error if not in initial loading phase
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/hotels" className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Hotel List
                </Link>
            </div>
        );
    }
    
    // --- Render Hotel Form ---
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-teal-50 to-emerald-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Hotel size={40} className="mr-3 text-teal-600" />
                {isEditMode ? 'Edit Hotel Details' : 'Add New Hotel'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto space-y-8 border border-teal-200 transform transition-transform duration-300 hover:scale-[1.005]">
                <FormSection title="Basic Information">
                    <InputField label="Hotel Name" id="name" name="name" type="text" value={formData.name} onChange={handleChange} required icon={Building} placeholder="e.g., Grand Hyatt" />
                    <InputField label="Location (e.g., City, State)" id="location" name="location" type="text" value={formData.location} onChange={handleChange} required icon={MapPin} placeholder="e.g., Lagos, Lagos State" />
                    <InputField label="Address" id="address" name="address" type="text" value={formData.address} onChange={handleChange} required icon={MapPin} placeholder="e.g., 123 Main St, Ikoyi" />
                    <TextareaField label="Description (Optional)" id="description" name="description" value={formData.description} onChange={handleChange} icon={Info} placeholder="A brief description of the hotel..." />
                </FormSection>

                <FormSection title="Features & Pricing">
                    <InputField label="Amenities (Comma-separated)" id="amenities" name="amenities" type="text" value={formData.amenities} onChange={handleChange} icon={Sparkles} placeholder="e.g., WiFi, Pool, Gym, Spa" />
                    <InputField label="Star Rating (1-5)" id="starRating" name="starRating" type="number" value={formData.starRating} onChange={handleChange} min="1" max="5" step="1" required icon={Star} placeholder="e.g., 5" />
                    <InputField label="Price Per Night" id="pricePerNight" name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} step="0.01" min="0" required icon={DollarSign} placeholder="e.g., 150000.00" />
                    <InputField label="Available Rooms" id="availableRooms" name="availableRooms" type="number" value={formData.availableRooms} onChange={handleChange} min="0" step="1" required icon={BedDouble} placeholder="e.g., 50" />
                </FormSection>

                <FormSection title="Visuals">
                    <InputField label="Image URLs (Comma-separated)" id="images" name="images" type="text" value={formData.images} onChange={handleChange} icon={Image} placeholder="e.g., http://img1.com/hotel.jpg, http://img2.com/hotel.jpg" />
                    <p className="text-sm text-gray-500 mt-2">Provide full URLs for hotel images, separated by commas.</p>
                </FormSection>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                    disabled={isSubmitting} // Disable button during submission
                >
                    {isSubmitting ? (
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
                            {isEditMode ? 'Update Hotel' : 'Add Hotel'}
                        </>
                    )}
                </button>
            </form>

            {/* Back to Hotels Button */}
            <div className="text-center mt-10">
                <Link to="/hotels" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="mr-2" /> Back to All Hotels
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
                // For number type inputs, ensure value is not an empty string when `min` is present,
                // as it can cause console warnings. Set to `undefined` or `null` if empty.
                value={type === 'number' && value === '' ? '' : value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                step={step}
                min={min}
                max={max}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition duration-200"
            />
        </div>
    </div>
);

// Reusable Textarea Field Component with Icon
const TextareaField = ({ label, id, name, value, onChange, placeholder, icon: Icon, rows = 3 }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative rounded-md shadow-sm">
            {Icon && (
                <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                className={`block w-full py-2.5 px-3 border border-gray-300 rounded-md leading-tight focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition duration-200 ${Icon ? 'pl-10' : ''}`}
            ></textarea>
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

export default HotelForm;