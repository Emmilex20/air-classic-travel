// frontend/src/pages/HotelList.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext'; // To get user roles and token

// Import icons from lucide-react for enhanced styling
import {
    PlusCircle,   // For Add New Hotel button
    MapPin,       // For location
    Star,         // For star rating
    DollarSign,   // For price per night
    BedDouble,    // For available rooms
    Eye,          // For View Details button
    Edit,         // For Edit button
    Trash2,       // For Delete button
    Hotel         // General hotel icon for heading/placeholder
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for currency formatting (consistent with FlightDetails)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN', // Using NGN for Naira symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function HotelList() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token } = useContext(AuthContext);

    // Helper to check if user has permission to manage hotels (admin or hotel_staff)
    const canManageHotels = user && (user.roles.includes('admin') || user.roles.includes('hotel_staff'));

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`${API_URL}/hotels`);
                setHotels(response.data);
                if (response.data.length === 0) {
                    toast.info("No hotels found at the moment.");
                }
            } catch (err) {
                console.error('Error fetching hotels:', err);
                const errorMsg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to load hotels.';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []); // Empty dependency array means this runs once on component mount

    const handleDelete = async (id) => {
        // Use toast.info with custom content for better UI than window.confirm
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to delete this hotel?</p>
                    <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                if (!token) {
                                    toast.error('Authentication token missing. Please log in.');
                                    closeToast();
                                    return;
                                }
                                if (!canManageHotels) {
                                    toast.error('You do not have permission to delete hotels.');
                                    closeToast();
                                    return;
                                }
                                try {
                                    const config = {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    };
                                    await axios.delete(`${API_URL}/hotels/${id}`, config);
                                    setHotels(hotels.filter((hotel) => hotel._id !== id)); // Remove deleted hotel from state
                                    toast.success('Hotel deleted successfully!');
                                } catch (err) {
                                    console.error('Error deleting hotel:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to delete hotel.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast(); // Close the confirmation toast
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    // --- Loading and Error States ---
    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100 p-4">
                <p className="text-xl text-gray-600 animate-pulse">Searching for amazing hotels...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-teal-50 to-emerald-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Hotel size={40} className="mr-3 text-teal-600"/> Discover Our Hotels
            </h1>

            {/* Conditionally render "Add Hotel" button with improved styling */}
            {canManageHotels && (
                <div className="mb-10 text-center">
                    <Link
                        to="/hotels/new"
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 group"
                    >
                        <PlusCircle size={20} className="mr-2 group-hover:rotate-90 transition-transform" />
                        Add New Hotel
                    </Link>
                </div>
            )}

            {hotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg text-gray-600 border border-gray-200">
                    <img src="https://placehold.co/120x120/A7F3D0/047857?text=No+Hotels" alt="No hotels found" className="mb-6 rounded-full p-2 border border-dashed border-gray-300" />
                    <p className="text-2xl font-semibold mb-3">No hotels available at the moment.</p>
                    <p className="text-md text-gray-500">Check back later or add a new one if you have permission!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotels.map((hotel) => (
                        <div key={hotel._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                            {hotel.images && hotel.images.length > 0 ? (
                                <img
                                    src={hotel.images[0]} // Display the first image
                                    alt={hotel.name}
                                    className="w-full h-56 object-cover object-center transform transition-transform duration-300 hover:scale-105"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2024/08/14/0955/LOSRL-P0008-Guestroom-Twin-Beds-Entrance.jpg/LOSRL-P0008-Guestroom-Twin-Beds-Entrance.4x3.jpg?imwidth=1920`; }}
                                />
                            ) : (
                                <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium">
                                    No Image Available
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-indigo-700 mb-3">{hotel.name}</h2>
                                <div className="space-y-2 text-gray-700 text-sm">
                                    <HotelDetailItem icon={MapPin} label="Location" value={hotel.location} />
                                    <HotelDetailItem icon={MapPin} label="Address" value={hotel.address} />
                                    <HotelDetailItem icon={Star} label="Rating" value={`${hotel.starRating} Stars`} />
                                    <HotelDetailItem icon={DollarSign} label="Price/Night" value={formatCurrency(hotel.pricePerNight)} /> {/* Applied formatting */}
                                    <HotelDetailItem
                                        icon={BedDouble}
                                        label="Rooms Available"
                                        value={hotel.availableRooms}
                                        valueClassName={hotel.availableRooms > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                                <Link
                                    to={`/hotels/${hotel._id}`}
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <Eye size={16} className="mr-2" /> Details
                                </Link>
                                {canManageHotels && (
                                    <>
                                        <Link
                                            to={`/hotels/edit/${hotel._id}`}
                                            className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Edit size={16} className="mr-2" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(hotel._id)}
                                            className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                        >
                                            <Trash2 size={16} className="mr-2" /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Reusable Hotel Detail Item Component
const HotelDetailItem = ({ label, value, icon: Icon, valueClassName = '' }) => (
    <p className="flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-teal-500 flex-shrink-0" />}
        <span className="font-semibold text-gray-800">{label}:</span> <span className={`ml-1 ${valueClassName}`}>{value}</span>
    </p>
);

export default HotelList;