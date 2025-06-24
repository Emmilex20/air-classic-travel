import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { PaystackButton } from 'react-paystack'; // NEW: Import PaystackButton
import Spinner from '../components/Spinner';

// Import icons from lucide-react
import {
    PlaneTakeoff,
    PlaneLanding,
    Calendar,
    Clock,
    DollarSign,
    Armchair,
    Users,
    Ticket,
    ArrowRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; // NEW: Get Paystack public key

// Helper function for currency formatting
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function FlightDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    const [outboundFlight, setOutboundFlight] = useState(null);
    const [returnFlight, setReturnFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [bookingType, setBookingType] = useState('one-way');
    const [totalPrice, setTotalPrice] = useState(0);

    // NEW: Paystack related states
    const [paystackConfig, setPaystackConfig] = useState(null);
    const [showPaystackButton, setShowPaystackButton] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false); // To prevent double clicks/submissions

    useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await axios.get(`${API_URL}/flights/${id}`);
                setOutboundFlight(response.data);

                const params = new URLSearchParams(location.search);
                const returnFlightId = params.get('returnFlightId');

                if (returnFlightId) {
                    setBookingType('round-trip');
                    const returnResponse = await axios.get(`${API_URL}/flights/${returnFlightId}`);
                    setReturnFlight(returnResponse.data);
                    // Initial total price calculation
                    setTotalPrice(response.data.price + returnResponse.data.price);
                } else {
                    setBookingType('one-way');
                    // Initial total price calculation
                    setTotalPrice(response.data.price);
                }

            } catch (err) {
                console.error('Error fetching flight details:', err);
                const errorMsg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to load flight details.';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchFlightDetails();
    }, [id, location.search]);

    // Recalculate total price when numberOfSeats changes
    useEffect(() => {
        if (outboundFlight) {
            let calculatedPrice = outboundFlight.price * numberOfSeats;
            if (bookingType === 'round-trip' && returnFlight) {
                calculatedPrice += returnFlight.price * numberOfSeats;
            }
            setTotalPrice(calculatedPrice);
        }
    }, [numberOfSeats, outboundFlight, returnFlight, bookingType]);


    const handleBookingInitiate = async (e) => {
        e.preventDefault();

        if (!user || !token) {
            toast.error('You must be logged in to book a flight.');
            return;
        }

        if (bookingInProgress) {
            toast.info('Booking process already initiated. Please wait or complete payment.');
            return;
        }

        let availableSeatsForBooking = outboundFlight.availableSeats;
        if (bookingType === 'round-trip' && returnFlight) {
            availableSeatsForBooking = Math.min(outboundFlight.availableSeats, returnFlight.availableSeats);
        }

        if (availableSeatsForBooking === 0) {
            toast.error('This flight (or one leg of the trip) is fully booked. Cannot make a reservation.');
            return;
        }

        const requestedSeats = parseInt(numberOfSeats, 10);

        if (isNaN(requestedSeats) || requestedSeats <= 0 || requestedSeats > availableSeatsForBooking) {
            toast.error(`Please enter a valid number of seats (1-${availableSeatsForBooking}).`);
            return;
        }

        // Basic passenger data: For a real app, you'd collect actual passenger details here.
        // For this example, we're using dummy data derived from the logged-in user.
        const passengersData = Array.from({ length: requestedSeats }).map((_, index) => ({
            firstName: user.firstName || `Guest${index + 1}`,
            lastName: user.lastName || 'Passenger',
            gender: 'Other', // Placeholder
            dateOfBirth: new Date('1990-01-01').toISOString(), // Placeholder
            nationality: user.address?.country || 'Unknown', // Placeholder
        }));

        const bookingPayload = {
            outboundFlightId: outboundFlight._id,
            bookingType: bookingType,
            passengers: passengersData,
        };

        if (bookingType === 'round-trip' && returnFlight) {
            bookingPayload.returnFlightId = returnFlight._id;
        }

        setBookingInProgress(true); // Disable booking form
        toast.info('Initiating booking. Please wait for payment prompt...');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const response = await axios.post(`${API_URL}/bookings`, bookingPayload, config);

            // Assuming the backend returns the necessary Paystack details
            const { paystackReference, totalAmount, userEmail, booking } = response.data;

            if (!paystackReference || !totalAmount || !userEmail || !booking) {
                throw new Error('Backend did not return required payment details.');
            }

            setPaystackConfig({
                reference: paystackReference,
                email: userEmail,
                amount: Math.round(totalAmount * 100), // Amount in kobo
                publicKey: PAYSTACK_PUBLIC_KEY,
                metadata: {
                    bookingId: booking._id, // Pass booking ID to Paystack for webhook
                    bookingType: 'flight', // Differentiate booking types in webhook
                },
            });

            setShowPaystackButton(true); // Show the Paystack button

        } catch (err) {
            setBookingInProgress(false); // Re-enable form on error
            console.error('Error initiating booking:', err);
            const errMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to initiate booking. Please try again.';
            toast.error(errMsg);
        }
    };

    // NEW: Paystack success handler
    const handlePaystackSuccess = async (response) => {
        console.log('Paystack Success Response:', response);
        setShowPaystackButton(false); // Hide the Paystack button
        setBookingInProgress(false); // Re-enable form

        if (!response || !response.reference || !paystackConfig) {
            toast.error('Paystack callback error: Missing response or config.');
            return;
        }

        try {
            toast.info('Verifying payment... Do not close this window.');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const verificationResponse = await axios.post(
                `${API_URL}/payments/verify`,
                {
                    reference: response.reference,
                    bookingId: paystackConfig.metadata.bookingId,
                    bookingType: paystackConfig.metadata.bookingType,
                },
                config
            );

            if (verificationResponse.status === 200) {
                toast.success('Payment confirmed and flight booked successfully!');
                // Update local state for available seats immediately (optimistic update)
                const requestedSeats = parseInt(numberOfSeats, 10);
                setOutboundFlight(prev => ({
                    ...prev,
                    availableSeats: prev.availableSeats - requestedSeats
                }));
                if (bookingType === 'round-trip' && returnFlight) {
                    setReturnFlight(prev => ({
                        ...prev,
                        availableSeats: prev.availableSeats - requestedSeats
                    }));
                }
                setNumberOfSeats(1); // Reset seats
                
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 2000);
            } else {
                toast.warn('Payment verified, but booking status could not be confirmed. Please check your bookings or contact support.');
            }

        } catch (error) {
            console.error('Error during payment verification:', error);
            const errMsg = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Payment verification failed. Please check your bookings or contact support.';
            toast.error(errMsg);
            // Consider what happens if verification fails - user might need to re-book or contact support
            // You might want to navigate to a "payment failed" page or keep them here
        }
    };

    // NEW: Paystack close handler
    const handlePaystackClose = () => {
        console.log('Paystack payment modal closed by user.');
        setShowPaystackButton(false); // Hide button
        setBookingInProgress(false); // Re-enable form
        toast.info('Payment cancelled by user. Please try again if you wish to book.');
        // At this point, the backend booking is still in 'pending' status.
        // It will either expire, or an admin needs to cancel it manually if not paid.
    };


    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Spinner size="lg" color="indigo" /> {/* <--- Spinner added here */}
                <p className="text-xl text-gray-600 mt-4 animate-pulse">Fetching flight details...</p> {/* Added mt-4 for spacing */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/flights" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Flight List
                </Link>
            </div>
        );
    }

    if (!outboundFlight) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gray-100 p-4">
                <p className="text-xl text-gray-600">Flight not found.</p>
                <Link to="/flights" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Flights
                </Link>
            </div>
        );
    }

    const currentAvailableSeats = bookingType === 'round-trip' && returnFlight
        ? Math.min(outboundFlight.availableSeats, returnFlight.availableSeats)
        : outboundFlight.availableSeats;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down">Flight Details</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Outbound Flight Card */}
                <FlightDetailCard
                    flight={outboundFlight}
                    title="Outbound Flight Details"
                    isOutbound={true}
                />

                {/* Return Flight Card (Conditionally rendered) */}
                {bookingType === 'round-trip' && returnFlight && (
                    <FlightDetailCard
                        flight={returnFlight}
                        title="Return Flight Details"
                        isOutbound={false}
                    />
                )}
            </div>

            {/* Booking Summary and Form Section */}
            <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-[1.005] border border-indigo-200">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {bookingType === 'round-trip' ? 'Complete Your Round Trip Booking' : 'Book Your One-Way Flight'}
                </h3>

                <div className="flex justify-center items-center mb-6">
                    <p className="text-4xl font-extrabold text-green-700 flex items-center">
                        <DollarSign size={32} className="mr-3 text-green-600" />
                        Total Price: {formatCurrency(totalPrice)}
                    </p>
                </div>

                {user ? (
                    currentAvailableSeats > 0 ? (
                        <form onSubmit={handleBookingInitiate} className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label htmlFor="numberOfSeats" className="block text-gray-700 text-lg font-bold mb-2">
                                    <Users size={20} className="inline-block mr-2" /> Number of Seats:
                                </label>
                                <input
                                    type="number"
                                    id="numberOfSeats"
                                    name="numberOfSeats"
                                    value={numberOfSeats}
                                    onChange={(e) => setNumberOfSeats(e.target.value)}
                                    min="1"
                                    max={currentAvailableSeats}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 text-lg transition duration-200"
                                    required
                                    disabled={bookingInProgress} // Disable input when booking is in progress
                                />
                                <p className="text-sm text-gray-500 mt-1">Available seats: {currentAvailableSeats}</p>
                            </div>
                            {!showPaystackButton ? (
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                                    disabled={bookingInProgress || currentAvailableSeats === 0}
                                >
                                    <Ticket size={24} className="mr-3 group-hover:rotate-6 transition-transform" />
                                    {bookingInProgress ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            ) : (
                                <div className="text-center">
                                    {paystackConfig && (
                                        <PaystackButton
                                            className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-xl font-semibold text-white bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                                            {...paystackConfig}
                                            onSuccess={handlePaystackSuccess}
                                            onClose={handlePaystackClose}
                                        >
                                            <DollarSign size={24} className="mr-3 group-hover:rotate-6 transition-transform" />
                                            Pay Now {formatCurrency(totalPrice)}
                                        </PaystackButton>
                                    )}
                                    <p className="mt-2 text-sm text-gray-600">
                                        A payment popup will appear. If not, click the "Pay Now" button.
                                    </p>
                                </div>
                            )}
                        </form>
                    ) : (
                        <p className="text-center text-red-600 text-xl font-semibold py-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                            This {bookingType === 'round-trip' ? 'journey' : 'flight'} is currently fully booked.
                        </p>
                    )
                ) : (
                    <p className="text-center text-gray-700 text-lg py-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                        Please <Link to="/login" className="text-indigo-600 hover:underline font-semibold">log in</Link> to book this {bookingType === 'round-trip' ? 'journey' : 'flight'}.
                    </p>
                )}
            </div>

            {/* Back to Flights Button */}
            <div className="text-center mt-12">
                <Link to="/flights" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowRight size={20} className="mr-2 rotate-180" /> Back to All Flights
                </Link>
            </div>
        </div>
    );
}

// Reusable Flight Detail Card Component (remains unchanged)
const FlightDetailCard = ({ flight, title, isOutbound }) => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 transform transition-all duration-300 hover:scale-[1.005] hover:shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <img src={`https://www.google.com/s2/favicons?domain=${flight.airline.toLowerCase().replace(/\s/g, '')}.com&sz=64`} alt={flight.airline} className="h-10 w-10 rounded-full border border-gray-200 p-1" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/E0E7FF/6366F1?text=${flight.airline.substring(0, 1)}` }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-lg text-gray-700">
            <DetailItem icon={isOutbound ? PlaneTakeoff : PlaneLanding} label="Airport" value={`${flight.departureAirport} to ${flight.arrivalAirport}`} />
            <DetailItem icon={Calendar} label="Date" value={new Date(flight.departureTime).toLocaleDateString()} />
            <DetailItem icon={Clock} label="Departure Time" value={new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <DetailItem icon={Clock} label="Arrival Time" value={new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            <DetailItem icon={DollarSign} label="Price" value={formatCurrency(flight.price)} />
            <DetailItem icon={Armchair} label="Seats Available" value={flight.availableSeats} />
            <DetailItem icon={Users} label="Capacity" value={flight.capacity} />
        </div>
    </div>
);

// Helper component for consistent detail item display (remains unchanged)
const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center p-2 rounded-md transition-colors duration-200 hover:bg-gray-50">
        {Icon && <Icon size={20} className="mr-3 text-indigo-500" />}
        <div>
            <span className="font-semibold text-gray-800">{label}:</span> <span className="text-gray-700">{value}</span>
        </div>
    </div>
);

export default FlightDetails;