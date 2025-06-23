// frontend/src/pages/HotelDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

// Import icons from lucide-react for enhanced styling
import {
    MapPin,       // For location/address
    Star,         // For star rating
    DollarSign,   // For price per night
    BedDouble,    // For rooms
    Calendar,     // For dates
    Users,        // For number of rooms input icon
    BookOpen,     // For booking button
    ArrowRight,   // For back button
    Hotel         // General hotel icon for heading/placeholder
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for currency formatting (consistent with FlightList & FlightDetails)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN', // Using NGN for Naira symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the booking form
    const [numberOfRooms, setNumberOfRooms] = useState(1);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    // State for active image in gallery
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`${API_URL}/hotels/${id}`);
                setHotel(response.data);
                if (response.data.images && response.data.images.length > 0) {
                    setActiveImage(response.data.images[0]); // Set the first image as active
                }
            } catch (err) {
                console.error('Error fetching hotel details:', err);
                const errorMsg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to load hotel details. Hotel might not exist.';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchHotelDetails();
    }, [id]);

    // Function to calculate min/max dates for date inputs
    const getMinCheckInDate = () => {
        const today = new Date();
        today.setDate(today.getDate()); // Today's date or later
        return today.toISOString().split('T')[0];
    };

    const getMinCheckOutDate = () => {
        if (!checkInDate) return '';
        const checkIn = new Date(checkInDate);
        checkIn.setDate(checkIn.getDate() + 1); // Day after check-in date
        return checkIn.toISOString().split('T')[0];
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation and authentication check
        if (!user || !token) {
            toast.error('You must be logged in to book a hotel.');
            navigate('/login'); // Redirect to login
            return;
        }

        if (!hotel || hotel.availableRooms === 0) {
            toast.error('This hotel currently has no rooms available. Cannot make a reservation.');
            return;
        }

        const roomsRequested = parseInt(numberOfRooms, 10);
        if (isNaN(roomsRequested) || roomsRequested <= 0 || roomsRequested > hotel.availableRooms) {
            toast.error(`Please enter a valid number of rooms (1-${hotel.availableRooms}).`);
            return;
        }

        if (!checkInDate || !checkOutDate) {
            toast.error('Please select both check-in and check-out dates.');
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkIn >= checkOut) {
            toast.error('Check-out date must be after check-in date.');
            return;
        }

        // Ensure check-in is not in the past relative to current time
        const now = new Date();
        now.setHours(0,0,0,0); // Reset time for comparison
        if (checkIn < now) {
            toast.error('Check-in date cannot be in the past.');
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            const bookingData = {
                hotelId: hotel._id,
                numberOfRooms: roomsRequested,
                checkInDate: checkIn.toISOString(), // Send as ISO string
                checkOutDate: checkOut.toISOString(), // Send as ISO string
            };

            const response = await axios.post(`${API_URL}/hotel-bookings`, bookingData, config);

            toast.success(`Hotel booking successful! Your booking ID is: ${response.data._id.substring(0, 8)}...`);

            // Optimistically update available rooms on the UI
            setHotel(prevHotel => ({
                ...prevHotel,
                availableRooms: prevHotel.availableRooms - roomsRequested
            }));
            setNumberOfRooms(1); // Reset form field
            setCheckInDate(''); // Reset dates
            setCheckOutDate('');

            // Redirect user to their bookings page after a short delay
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000);

        } catch (err) {
            console.error('Error creating hotel booking:', err);
            const errMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to create hotel booking. Please try again.';
            toast.error(errMsg);
        }
    };

    // --- Loading, Error, and Not Found States ---
    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100 p-4">
                <p className="text-xl text-gray-600 animate-pulse">Loading hotel details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/hotels" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Hotels
                </Link>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gray-100 p-4">
                <p className="text-xl text-gray-600">Hotel not found.</p>
                <Link to="/hotels" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Hotels
                </Link>
            </div>
        );
    }

    // --- Render Hotel Details and Booking Form ---
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-teal-50 to-emerald-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Hotel size={40} className="mr-3 text-teal-600"/> {hotel.name}
            </h1>

            {/* Hotel Information Card */}
            <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border border-gray-200 transform transition-transform duration-300 hover:scale-[1.005]">
                {/* Image Gallery */}
                {hotel.images && hotel.images.length > 0 && (
                    <div className="mb-6">
                        <div className="w-full h-96 overflow-hidden rounded-lg shadow-xl mb-4">
                            <img
                                src={activeImage || hotel.images[0]} // Display active image or first image
                                alt={hotel.name}
                                className="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x400/E0E7FF/6366F1?text=Hotel+Image`; }}
                            />
                        </div>
                        {hotel.images.length > 1 && (
                            <div className="flex justify-center flex-wrap gap-3 mt-4">
                                {hotel.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${hotel.name} - Thumbnail ${index + 1}`}
                                        className={`w-24 h-20 object-cover rounded-md shadow-sm cursor-pointer border-2 transition-all duration-200 ${activeImage === img ? 'border-indigo-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        onClick={() => setActiveImage(img)}
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x80/E0E7FF/6366F1?text=Img`; }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <h2 className="text-3xl font-bold text-indigo-700 mb-4">{hotel.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
                    <DetailItem icon={MapPin} label="Location" value={hotel.location} />
                    <DetailItem icon={MapPin} label="Address" value={hotel.address} />
                    <DetailItem icon={Star} label="Rating" value={`${hotel.starRating} Stars`} />
                    <DetailItem icon={DollarSign} label="Price Per Night" value={formatCurrency(hotel.pricePerNight)} />
                    <DetailItem
                        icon={BedDouble}
                        label="Rooms Available"
                        value={hotel.availableRooms}
                        valueClassName={hotel.availableRooms > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                    />
                </div>
                {hotel.description && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                    </div>
                )}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Key Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {hotel.amenities.map((amenity, index) => (
                                <span key={index} className="bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition duration-200 hover:bg-indigo-200">
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Form Section */}
            <div className="bg-white rounded-xl shadow-2xl p-8 mt-8 border border-teal-200 transform transition-transform duration-300 hover:scale-[1.005]">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Book Your Stay</h3>
                
                {user ? (
                    hotel.availableRooms > 0 ? (
                        <form onSubmit={handleBookingSubmit} className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label htmlFor="numberOfRooms" className="block text-gray-700 text-lg font-bold mb-2">
                                    <Users size={20} className="inline-block mr-2 text-blue-500" /> Number of Rooms:
                                </label>
                                <input
                                    type="number"
                                    id="numberOfRooms"
                                    name="numberOfRooms"
                                    value={numberOfRooms}
                                    onChange={(e) => setNumberOfRooms(e.target.value)}
                                    min="1"
                                    max={hotel.availableRooms}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-lg transition duration-200"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Available rooms: {hotel.availableRooms}</p>
                            </div>
                            <div>
                                <label htmlFor="checkInDate" className="block text-gray-700 text-lg font-bold mb-2">
                                    <Calendar size={20} className="inline-block mr-2 text-blue-500" /> Check-in Date:
                                </label>
                                <input
                                    type="date"
                                    id="checkInDate"
                                    name="checkInDate"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    min={getMinCheckInDate()}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-lg transition duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="checkOutDate" className="block text-gray-700 text-lg font-bold mb-2">
                                    <Calendar size={20} className="inline-block mr-2 text-blue-500" /> Check-out Date:
                                </label>
                                <input
                                    type="date"
                                    id="checkOutDate"
                                    name="checkOutDate"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    min={getMinCheckOutDate()}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-lg transition duration-200"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                            >
                                <BookOpen size={24} className="mr-3 group-hover:rotate-6 transition-transform" />
                                Book Now
                            </button>
                        </form>
                    ) : (
                        <p className="text-center text-red-600 text-xl font-semibold py-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                            This hotel is currently fully booked.
                        </p>
                    )
                ) : (
                    <p className="text-center text-gray-700 text-lg py-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                        Please <Link to="/login" className="text-indigo-600 hover:underline font-semibold">log in</Link> to book a hotel.
                    </p>
                )}
            </div>

            {/* Back to Hotels Button */}
            <div className="text-center mt-12">
                <Link to="/hotels" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowRight size={20} className="mr-2 rotate-180" /> Back to All Hotels
                </Link>
            </div>
        </div>
    );
}

// Helper component for consistent detail item display (can be shared across pages)
const DetailItem = ({ icon: Icon, label, value, valueClassName = '' }) => (
    <div className="flex items-center p-2 rounded-md transition-colors duration-200 hover:bg-gray-50">
        {Icon && <Icon size={20} className="mr-3 text-indigo-500" />}
        <div>
            <span className="font-semibold text-gray-800">{label}:</span> <span className={`text-gray-700 ${valueClassName}`}>{value}</span>
        </div>
    </div>
);

export default HotelDetails;