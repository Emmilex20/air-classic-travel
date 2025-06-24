// frontend/src/pages/MyBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

// Import icons from lucide-react for enhanced styling
import {
    PlaneTakeoff,     // For flight departure
    PlaneLanding,     // For flight arrival
    Calendar,         // For dates (flight & hotel)
    DollarSign,       // For price
    Users,            // For number of passengers/rooms
    Tag,              // For booking status
    Hotel,            // General hotel icon
    Ticket,           // General flight ticket icon
    XCircle,          // For cancel button
    ChevronRight,     // For general forward movement/detail
    Plane,            // Alternative flight icon
    Building,         // Alternative hotel icon
    BookOpen,// For general bookings page title (THIS WAS THE ICON IN QUESTION)
    BedDouble,
    MapPin,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for currency formatting (consistent across all pages)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN', // Using NGN for Naira symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function MyBookings() {
    const { token } = useContext(AuthContext);
    const [flightBookings, setFlightBookings] = useState([]);
    const [hotelBookings, setHotelBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('flights'); // 'flights' or 'hotels'

    useEffect(() => {
        const fetchMyBookings = async () => {
            if (!token) {
                setError('You must be logged in to view your bookings.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const flightResponse = await axios.get(`${API_URL}/bookings/my-bookings`, config);
                setFlightBookings(flightResponse.data);

                const hotelResponse = await axios.get(`${API_URL}/hotel-bookings/my-bookings`, config);
                setHotelBookings(hotelResponse.data);

            } catch (err) {
                console.error('Error fetching bookings:', err);
                const errorMsg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to load your bookings.';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchMyBookings();
    }, [token]); // Re-fetch if token changes

    const handleFlightCancel = async (bookingId) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to cancel this flight booking?</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                try {
                                    const config = { headers: { Authorization: `Bearer ${token}` } };
                                    await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, config);
                                    setFlightBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b));
                                    toast.success('Flight booking cancelled successfully!');
                                } catch (err) {
                                    console.error('Error cancelling flight booking:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to cancel flight booking.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast();
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Yes, Cancel
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Keep Booking
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    const handleHotelCancel = async (bookingId) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to cancel this hotel booking?</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                try {
                                    const config = { headers: { Authorization: `Bearer ${token}` } };
                                    await axios.put(`${API_URL}/hotel-bookings/${bookingId}/cancel`, {}, config);
                                    setHotelBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b));
                                    toast.success('Hotel booking cancelled successfully!');
                                } catch (err) {
                                    console.error('Error cancelling hotel booking:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to cancel hotel booking.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast();
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Yes, Cancel
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Keep Booking
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Spinner size="lg" color="indigo" />
                <p className="text-xl text-gray-600 animate-pulse">Loading your travel plans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/login" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Login to View Bookings
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <BookOpen size={40} className="mr-3 text-indigo-600" /> My Travel Bookings
            </h1>

            {/* Tabs for Flight and Hotel Bookings */}
            <div className="flex justify-center mb-10 bg-white rounded-xl shadow-lg p-2 max-w-lg mx-auto border border-gray-100">
                <button
                    onClick={() => setActiveTab('flights')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        activeTab === 'flights' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-transparent text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <Plane size={20} className="mr-2" /> Flight Bookings ({flightBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('hotels')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        activeTab === 'hotels' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-transparent text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <Building size={20} className="mr-2" /> Hotel Bookings ({hotelBookings.length})
                </button>
            </div>

            {/* Display Flight Bookings */}
            {activeTab === 'flights' && (
                <div className="bg-white rounded-xl shadow-2xl p-8 border border-indigo-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Flight Reservations</h2>
                    {flightBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                            <Ticket size={64} className="mb-4 text-indigo-400" />
                            <p className="text-xl font-semibold mb-2">No flight bookings found.</p>
                            <p className="text-md text-gray-500">Time to plan your next adventure!</p>
                            <Link to="/flights" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                                Browse Flights
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {flightBookings.map((booking) => (
                                <FlightBookingCard key={booking._id} booking={booking} onCancel={handleFlightCancel} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Display Hotel Bookings */}
            {activeTab === 'hotels' && (
                <div className="bg-white rounded-xl shadow-2xl p-8 border border-teal-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Hotel Reservations</h2>
                    {hotelBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                            <Hotel size={64} className="mb-4 text-teal-400" />
                            <p className="text-xl font-semibold mb-2">No hotel bookings found.</p>
                            <p className="text-md text-gray-500">Find a perfect place to stay for your next trip!</p>
                            <Link to="/hotels" className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                                Explore Hotels
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {hotelBookings.map((booking) => (
                                <HotelBookingCard key={booking._id} booking={booking} onCancel={handleHotelCancel} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Reusable Flight Booking Card Component
const FlightBookingCard = ({ booking, onCancel }) => {
    const isCancelled = booking.bookingStatus === 'cancelled';
    const departureDate = booking.outboundFlight ? new Date(booking.outboundFlight.departureTime).toLocaleDateString() : 'N/A';
    const returnDate = booking.returnFlight ? new Date(booking.returnFlight.departureTime).toLocaleDateString() : 'N/A';

    return (
        <div className={`bg-gray-50 rounded-xl shadow-md p-6 border ${isCancelled ? 'border-red-300 opacity-70' : 'border-indigo-200'} flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.005] hover:shadow-lg`}>
            <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-indigo-700 flex items-center">
                        <Ticket size={20} className="mr-2" /> Booking ID: {booking._id.substring(0, 8)}...
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </span>
                </div>

                {booking.outboundFlight ? (
                    <div className="space-y-2 mb-4">
                        <BookingDetailItem icon={PlaneTakeoff} label="Outbound Flight" value={`${booking.outboundFlight.airline} - ${booking.outboundFlight.flightNumber}`} />
                        <BookingDetailItem label="Route" value={`${booking.outboundFlight.departureAirport} ${String.fromCharCode(8594)} ${booking.outboundFlight.arrivalAirport}`} />
                        <BookingDetailItem icon={Calendar} label="Departure Date" value={departureDate} />
                        {booking.bookingType === 'round-trip' && booking.returnFlight && (
                            <>
                                <hr className="my-2 border-gray-100" />
                                <BookingDetailItem icon={PlaneLanding} label="Return Flight" value={`${booking.returnFlight.airline} - ${booking.returnFlight.flightNumber}`} />
                                <BookingDetailItem label="Route" value={`${booking.returnFlight.departureAirport} ${String.fromCharCode(8594)} ${booking.returnFlight.arrivalAirport}`} />
                                <BookingDetailItem icon={Calendar} label="Return Date" value={returnDate} />
                            </>
                        )}
                        <BookingDetailItem icon={Users} label="Passengers" value={booking.passengers.length} />
                        <BookingDetailItem icon={DollarSign} label="Total Price" value={formatCurrency(booking.totalPrice)} />
                    </div>
                ) : (
                    <p className="text-red-500 text-center py-4">Flight details unavailable for this booking.</p>
                )}
            </div>
            {!isCancelled && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onCancel(booking._id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-[1.01]"
                    >
                        <XCircle size={18} className="mr-2" /> Cancel Booking
                    </button>
                </div>
            )}
        </div>
    );
};

// Reusable Hotel Booking Card Component
const HotelBookingCard = ({ booking, onCancel }) => {
    const isCancelled = booking.bookingStatus === 'cancelled';
    const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A';
    const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A';

    return (
        <div className={`bg-gray-50 rounded-xl shadow-md p-6 border ${isCancelled ? 'border-red-300 opacity-70' : 'border-teal-200'} flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.005] hover:shadow-lg`}>
            <div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-teal-700 flex items-center">
                        <Hotel size={20} className="mr-2" /> Booking ID: {booking._id.substring(0, 8)}...
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </span>
                </div>

                {booking.hotel ? (
                    <div className="space-y-2 mb-4">
                        <BookingDetailItem label="Hotel" value={booking.hotel.name} />
                        <BookingDetailItem icon={MapPin} label="Location" value={booking.hotel.location} />
                        <BookingDetailItem icon={Calendar} label="Check-in Date" value={checkIn} />
                        <BookingDetailItem icon={Calendar} label="Check-out Date" value={checkOut} />
                        <BookingDetailItem icon={BedDouble} label="Number of Rooms" value={booking.numberOfRooms} />
                        <BookingDetailItem icon={DollarSign} label="Total Price" value={formatCurrency(booking.totalPrice)} />
                    </div>
                ) : (
                    <p className="text-red-500 text-center py-4">Hotel details unavailable for this booking.</p>
                )}
            </div>
            {!isCancelled && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onCancel(booking._id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center transition duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-[1.01]"
                    >
                        <XCircle size={18} className="mr-2" /> Cancel Booking
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper component for consistent detail item display within booking cards
const BookingDetailItem = ({ label, value, icon: Icon }) => (
    <p className="flex items-center text-gray-700 text-sm">
        {Icon && <Icon size={16} className="mr-2 text-gray-500 flex-shrink-0" />}
        <span className="font-semibold mr-1">{label}:</span> {value}
    </p>
);

export default MyBookings;