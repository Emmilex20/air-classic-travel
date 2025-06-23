// frontend/src/pages/AllBookings.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Import icons from lucide-react
import {
    ClipboardList,      // Main icon for All Bookings
    Plane,              // Flight icon
    Hotel,              // Hotel icon
    Loader2,            // Loading spinner
    CircleAlert,        // Error icon
    ArrowLeft,          // Back to dashboard
    PlaneTakeoff,       // Flight details
    PlaneLanding,       // Flight details
    Calendar,           // Dates
    DollarSign,         // Price
    Users,              // Passengers/Rooms
    Tag,                // Status
    XCircle,            // Cancel action
    MapPin,             // Hotel location
    BedDouble,          // Hotel rooms
    CheckCircle,        // For confirmed/completed status
    MinusCircle,        // For pending status
    Ban,                // For failed/cancelled status
    Trash2,             // Added for Delete action
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for currency formatting
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function AllBookings() {
    const { user, token, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [flightBookings, setFlightBookings] = useState([]);
    const [hotelBookings, setHotelBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('flights'); // 'flights' or 'hotels'

    // Permission check and initial data fetch
    useEffect(() => {
        if (!authLoading) { // Wait for auth context to load
            if (!user || !user.roles.includes('admin')) {
                toast.error('Access Denied: You must be an administrator to view this page.');
                navigate('/dashboard'); // Redirect to dashboard
                return;
            }
            fetchAllBookings();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token, authLoading, navigate]);

    const fetchAllBookings = async () => {
        if (!token) {
            setError('Authentication token missing. Please log in.');
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

            // Fetch all flight bookings (admin endpoint)
            const flightResponse = await axios.get(`${API_URL}/bookings`, config); // Assuming /api/bookings for ALL flights
            setFlightBookings(flightResponse.data);

            // Fetch all hotel bookings (admin endpoint)
            const hotelResponse = await axios.get(`${API_URL}/hotel-bookings`, config); // Assuming /api/hotel-bookings for ALL hotels
            setHotelBookings(hotelResponse.data);

        } catch (err) {
            console.error('Error fetching all bookings:', err);
            const errorMsg = err.response?.data?.message || 'Failed to load all bookings. You might not have permission.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to update booking status (for both flights and hotels)
    const updateBookingStatus = async (bookingId, bookingType, newBookingStatus, newPaymentStatus) => {
        if (!token) {
            toast.error('Authentication token missing.');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let endpoint = '';
            let updatePayload = {};

            if (bookingType === 'flight') {
                endpoint = `${API_URL}/admin/bookings/${bookingId}/status`;
                updatePayload = {
                    bookingStatus: newBookingStatus,
                    paymentStatus: newPaymentStatus,
                };
            } else if (bookingType === 'hotel') {
                endpoint = `${API_URL}/admin/hotel-bookings/${bookingId}/status`;
                updatePayload = {
                    bookingStatus: newBookingStatus,
                    paymentStatus: newPaymentStatus,
                };
            }

            const { data } = await axios.put(endpoint, updatePayload, config);

            // Update local state with the new status
            if (bookingType === 'flight') {
                setFlightBookings(prev => prev.map(b => b._id === bookingId ? data : b));
            } else if (bookingType === 'hotel') {
                setHotelBookings(prev => prev.map(b => b._id === bookingId ? data : b));
            }
            toast.success(`${bookingType === 'flight' ? 'Flight' : 'Hotel'} booking status updated successfully!`);
        } catch (err) {
            console.error(`Error updating ${bookingType} booking status:`, err);
            const errorMsg = err.response?.data?.message || `Failed to update ${bookingType} booking status.`;
            toast.error(errorMsg);
        }
    };

    const handleDeleteBooking = (bookingId, bookingType) => {
    toast.info(
        ({ closeToast }) => (
            <div className="text-center">
                <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to delete this {bookingType} booking permanently?</p>
                <p className="text-sm text-gray-600 mb-4">This action cannot be undone and will remove the booking record from the database.</p>
                <div className="flex justify-center space-x-4 mt-3">
                    <button
                        onClick={async () => {
                            if (!token) {
                                toast.error('Authentication token missing.');
                                closeToast();
                                return;
                            }
                            try {
                                const config = { headers: { Authorization: `Bearer ${token}` } };
                                const endpoint = bookingType === 'flight'
                                    ? `${API_URL}/bookings/admin/${bookingId}` // <-- This line needs review
                                    : `${API_URL}/hotel-bookings/admin/${bookingId}`;
                                await axios.delete(endpoint, config);

                                // Remove from local state
                                if (bookingType === 'flight') {
                                    setFlightBookings(prev => prev.filter(b => b._id !== bookingId));
                                } else if (bookingType === 'hotel') {
                                    setHotelBookings(prev => prev.filter(b => b._id !== bookingId));
                                }
                                toast.success(`${bookingType === 'flight' ? 'Flight' : 'Hotel'} booking deleted successfully!`);
                            } catch (err) {
                                console.error(`Error deleting ${bookingType} booking:`, err);
                                const errorMsg = err.response?.data?.message || `Failed to delete ${bookingType} booking.`;
                                toast.error(errorMsg);
                            } finally {
                                closeToast();
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                    >
                        <Trash2 size={14} className="inline mr-1" /> Yes, Delete Permanently
                    </button>
                    <button
                        onClick={closeToast}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                    >
                        No, Keep Record
                    </button>
                </div>
            </div>
        ),
        { closeButton: false, autoClose: false, closeOnClick: false }
    );
};

    const handleConfirmPayment = (bookingId, bookingType) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Confirm payment for this {bookingType} booking?</p>
                    <p className="text-sm text-gray-600 mb-4">This will mark the payment as 'completed' and the booking as 'confirmed'.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={() => {
                                updateBookingStatus(bookingId, bookingType, 'confirmed', 'completed');
                                closeToast();
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Yes, Confirm
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            No, Keep Pending
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    const handleFlightCancel = async (bookingId) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to cancel this flight booking?</p>
                    <p className="text-sm text-gray-600 mb-4">This will mark the booking as 'cancelled' and refund seats. This action cannot be undone.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                await updateBookingStatus(bookingId, 'flight', 'cancelled', 'failed');
                                closeToast();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            <XCircle size={14} className="inline mr-1" /> Yes, Cancel
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
                    <p className="text-sm text-gray-600 mb-4">This will mark the booking as 'cancelled' and refund rooms. This action cannot be undone.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                await updateBookingStatus(bookingId, 'hotel', 'cancelled', 'failed');
                                closeToast();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            <XCircle size={14} className="inline mr-1" /> Yes, Cancel
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

    // Helper to get status pill styling
    const getStatusPill = (status, type) => {
        let bgColor = '';
        let textColor = '';
        let icon = null;

        if (type === 'booking') {
            switch (status) {
                case 'confirmed':
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                    icon = <CheckCircle size={14} className="inline mr-1" />;
                    break;
                case 'pending':
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                    icon = <MinusCircle size={14} className="inline mr-1" />;
                    break;
                case 'cancelled':
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    icon = <Ban size={14} className="inline mr-1" />;
                    break;
                case 'completed': // For when bookingStatus directly becomes 'completed' after trip
                    bgColor = 'bg-blue-100';
                    textColor = 'text-blue-800';
                    icon = <CheckCircle size={14} className="inline mr-1" />;
                    break;
                default:
                    bgColor = 'bg-gray-100';
                    textColor = 'text-gray-800';
                    icon = <Tag size={14} className="inline mr-1" />;
            }
        } else if (type === 'payment') {
            switch (status) {
                case 'completed':
                    bgColor = 'bg-blue-100'; // Using blue for completed payments
                    textColor = 'text-blue-800';
                    icon = <CheckCircle size={14} className="inline mr-1" />;
                    break;
                case 'pending':
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                    icon = <MinusCircle size={14} className="inline mr-1" />;
                    break;
                case 'failed':
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                    icon = <Ban size={14} className="inline mr-1" />;
                    break;
                case 'refunded':
                    bgColor = 'bg-purple-100';
                    textColor = 'text-purple-800';
                    icon = <ArrowLeft size={14} className="inline mr-1" />; // Re-using ArrowLeft for refund
                    break;
                default:
                    bgColor = 'bg-gray-100';
                    textColor = 'text-gray-800';
                    icon = <Tag size={14} className="inline mr-1" />;
            }
        }

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
                {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };


    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Loader2 className="animate-spin text-indigo-500 mr-3" size={32} />
                <p className="text-xl text-gray-600">Loading all bookings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <CircleAlert size={48} className="text-red-700 mb-4" />
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/dashboard" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <ClipboardList size={40} className="mr-3 text-indigo-600" /> All Bookings Overview
            </h1>

            {/* Tabs for Flight and Hotel Bookings */}
            <div className="flex justify-center mb-10 bg-white rounded-xl shadow-lg p-2 max-w-lg mx-auto border border-gray-100">
                <button
                    onClick={() => setActiveTab('flights')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        activeTab === 'flights' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-transparent text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <Plane size={20} className="mr-2" /> Flights ({flightBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('hotels')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                        activeTab === 'hotels' ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-transparent text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                >
                    <Hotel size={20} className="mr-2" /> Hotels ({hotelBookings.length})
                </button>
            </div>

            {/* Display Flight Bookings Table */}
            {activeTab === 'flights' && (
                <div className="bg-white rounded-xl shadow-2xl p-8 border border-indigo-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Flight Bookings</h2>
                    {flightBookings.length === 0 ? (
                        <div className="text-center py-10 text-gray-600">
                            <Plane size={64} className="mb-4 text-indigo-400 mx-auto" />
                            <p className="text-xl font-semibold mb-2">No flight bookings found.</p>
                            <p className="text-md text-gray-500">The system currently has no flight reservations.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Booking ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {flightBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking._id.substring(0, 8)}...</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.user?.email || 'N/A'}</td> {/* Assuming user is populated */}
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {booking.outboundFlight ? `${booking.outboundFlight.airline} (${booking.outboundFlight.flightNumber})` : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {booking.outboundFlight ? `${booking.outboundFlight.departureAirport} → ${booking.outboundFlight.arrivalAirport}` : 'N/A'}
                                                {booking.bookingType === 'round-trip' && booking.returnFlight && ` (Round-trip)`}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {booking.outboundFlight ? new Date(booking.outboundFlight.departureTime).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.passengers.length}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(booking.totalPrice)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {getStatusPill(booking.bookingStatus, 'booking')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {getStatusPill(booking.paymentStatus, 'payment')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                {booking.paymentStatus === 'pending' && booking.bookingStatus === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirmPayment(booking._id, 'flight')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors mr-2"
                                                        title="Manually confirm payment for this booking"
                                                    >
                                                        <CheckCircle size={14} className="mr-1" /> Confirm Payment
                                                    </button>
                                                )}
                                                {booking.bookingStatus !== 'cancelled' ? (
                                                    <button
                                                        onClick={() => handleFlightCancel(booking._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                        title="Cancel this flight booking"
                                                    >
                                                        <XCircle size={14} className="mr-1" /> Cancel
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking._id, 'flight')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition-colors"
                                                        title="Delete this flight booking permanently"
                                                    >
                                                        <Trash2 size={14} className="mr-1" /> Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Display Hotel Bookings Table */}
            {activeTab === 'hotels' && (
                <div className="bg-white rounded-xl shadow-2xl p-8 border border-teal-200">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Hotel Bookings</h2>
                    {hotelBookings.length === 0 ? (
                        <div className="text-center py-10 text-gray-600">
                            <Hotel size={64} className="mb-4 text-teal-400 mx-auto" />
                            <p className="text-xl font-semibold mb-2">No hotel bookings found.</p>
                            <p className="text-md text-gray-500">The system currently has no hotel reservations.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Booking ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {hotelBookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking._id.substring(0, 8)}...</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.user?.email || 'N/A'}</td> {/* Assuming user is populated */}
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.hotel?.name || 'N/A'}</td> {/* Assuming hotel is populated */}
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{booking.numberOfRooms}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.checkInDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(booking.totalPrice)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {getStatusPill(booking.bookingStatus, 'booking')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                {getStatusPill(booking.paymentStatus, 'payment')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                {booking.paymentStatus === 'pending' && booking.bookingStatus === 'pending' && (
                                                    <button
                                                        onClick={() => handleConfirmPayment(booking._id, 'hotel')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors mr-2"
                                                        title="Manually confirm payment for this booking"
                                                    >
                                                        <CheckCircle size={14} className="mr-1" /> Confirm Payment
                                                    </button>
                                                )}
                                                {booking.bookingStatus !== 'cancelled' ? (
                                                    <button
                                                        onClick={() => handleHotelCancel(booking._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                        title="Cancel this hotel booking"
                                                    >
                                                        <XCircle size={14} className="mr-1" /> Cancel
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking._id, 'hotel')}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition-colors"
                                                        title="Delete this hotel booking permanently"
                                                    >
                                                        <Trash2 size={14} className="mr-1" /> Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Back to Dashboard Button */}
            <div className="text-center mt-10">
                <Link to="/dashboard" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default AllBookings;