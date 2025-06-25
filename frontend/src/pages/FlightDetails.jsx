/* eslint-disable no-unused-vars */
// frontend/src/pages/FlightDetails.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { PaystackButton } from 'react-paystack';
import Spinner from '../components/Spinner';
import { format, parseISO } from 'date-fns'; // For date formatting

// Import icons from lucide-react
import {
    Plane,
    PlaneTakeoff,
    PlaneLanding,
    Calendar,
    Clock,
    DollarSign,
    Armchair,
    Users,
    Ticket,
    ArrowLeft,
    Info,
    Route,
    DoorOpen,
    Building,
    Luggage,
    CreditCard,
    Hourglass
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// SIMPLIFIED HELPER: This function now ONLY formats the amount.
// It assumes the amount passed to it is ALREADY in NGN.
const formatCurrency = (amount) => {
    // If amount is NaN or null/undefined, return a friendly message
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'N/A'; // Or 'Invalid Price'
    }
    
    // Ensure 2 decimal places for currency display
    return new Intl.NumberFormat('en-NG', { // Always format as NGN
        style: 'currency',
        currency: 'NGN', // Target currency is NGN
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount); // Formats the already NGN amount
};

// Helper for formatting time (e.g., 2:30 PM)
const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    return format(parseISO(isoString), 'p');
};

// Helper for formatting date (e.g., Jun 25, 2025)
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return format(parseISO(isoString), 'MMM dd,yyyy');
};

// Helper to calculate and format duration (e.g., 2h 30m)
const calculateDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};


// Helper for rendering segments for a given leg (outbound or return)
const renderLegSegments = (leg, title, iconColor) => {
    if (!leg || !leg.segments || leg.segments.length === 0) {
        // This case should ideally not happen for valid flight data, but for robustness:
        return (
            <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    {title} <Route size={24} className={`ml-2 ${iconColor}`} />
                </h3>
                <p className="text-gray-600 italic">No segment details available for {title.toLowerCase()} journey.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                {title} <Route size={24} className={`ml-2 ${iconColor}`} />
            </h3>
            <div className="space-y-4">
                {leg.segments.map((segment, idx) => (
                    <div key={`${segment.flightNumber}-${idx}`} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                            <Info size={16} className="text-blue-500 mr-2" />
                            Flight Leg {idx + 1} of {leg.segments.length}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-gray-700 text-sm">
                            <p><span className="font-medium">Airline:</span> {segment.airlineName || segment.airline} ({segment.airlineCode})</p> {/* Use airlineName if available */}
                            <p><span className="font-medium">Flight No:</span> {segment.flightNumber}</p>
                            <p><span className="font-medium">Aircraft:</span> {segment.aircraftType}</p>
                            <p><span className="font-medium">Depart:</span> {segment.departureAirport} ({segment.departureAirportCode}) <span className="font-medium">@</span> {formatTime(segment.departureTime)}</p>
                            <p><span className="font-medium">Arrive:</span> {segment.arrivalAirport} ({segment.arrivalAirportCode}) <span className="font-medium">@</span> {formatTime(segment.arrivalTime)}</p>
                            <p><span className="font-medium">Duration:</span> {calculateDuration(segment.durationMinutes)}</p>
                            {segment.departureTerminal && <p className="flex items-center"><DoorOpen size={14} className="mr-1 text-gray-500" /><span className="font-medium">Dep. Terminal:</span> {segment.departureTerminal}</p>}
                            {segment.arrivalTerminal && <p className="flex items-center"><Building size={14} className="mr-1 text-gray-500" /><span className="font-medium">Arr. Terminal:</span> {segment.arrivalTerminal}</p>}
                        </div>
                        {idx < leg.segments.length - 1 && (
                            <div className="mt-4 border-t pt-3 border-dashed border-gray-300 text-center text-gray-600 text-sm">
                                <Clock size={16} className="inline-block mr-1" />
                                Layover in {segment.arrivalAirport} ({segment.arrivalAirportCode}) for {
                                    calculateDuration(
                                        (parseISO(leg.segments[idx + 1].departureTime).getTime() - parseISO(segment.arrivalTime).getTime()) / (1000 * 60)
                                    )
                                }
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-indigo-100 rounded-lg text-indigo-800 font-semibold flex items-center justify-center">
                <Hourglass size={18} className="mr-2" /> Total {title} Duration: {calculateDuration(leg.totalDurationMinutes || leg.durationMinutes)} {/* Use totalDurationMinutes for Amadeus, durationMinutes for simple */}
            </div>
        </div>
    );
};


function FlightDetails() {
    const { id } = useParams(); // This 'id' is from the URL: can be DB ID or 'amadeus-{offerId}'
    const location = useLocation(); // To access state passed from FlightList
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);

    // This `flight` state will hold the entire flight object (either flat DB flight or nested Amadeus offer)
    const [flight, setFlight] = useState(location.state?.flightData || null);
    const [loading, setLoading] = useState(true); // Always start loading
    const [error, setError] = useState(null);
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    // Paystack related states
    const [paystackConfig, setPaystackConfig] = useState(null);
    const [showPaystackButton, setShowPaystackButton] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    // State for currency exchange rate (EUR to NGN) and its loading state
    const [eurToNgnRate, setEurToNgnRate] = useState(null);
    const [currencyRateLoading, setCurrencyRateLoading] = useState(true);

    // Determine booking type for display and payload based on flight structure
    // An Amadeus round-trip offer will have `flight.outboundFlight` and `flight.returnFlight`
    // A one-way flight (either Amadeus or DB) will NOT have these nested objects.
    const isRoundTripDisplay = flight && flight.outboundFlight && flight.returnFlight;

    // Effect to fetch/simulate currency exchange rate on component mount
    useEffect(() => {
        const fetchExchangeRate = async () => {
            setCurrencyRateLoading(true);
            try {
                // FOR DEMONSTRATION: This must match the backend's fixed rate
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                setEurToNgnRate(1600); // FIXED: Ensure this matches backend EUR_TO_NGN_EXCHANGE_RATE
                console.log("Simulated EUR to NGN exchange rate set: 1600 on FlightDetails");
            } catch (err) {
                console.error("Error fetching exchange rate:", err);
                toast.error("Failed to load currency exchange rate on details page.");
                setEurToNgnRate(null); // Set to null on error
            } finally {
                setCurrencyRateLoading(false);
            }
        };
        fetchExchangeRate();
    }, []); // Run only once on component mount

    // NEW HELPER: Converts amount to NGN based on its source currency and exchange rate.
    // This helper now encapsulates the conversion logic.
    const convertAmountForDisplay = useCallback((amount, sourceCurrency) => {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return 0; // Return 0 for calculation purposes; formatCurrency will handle 'N/A' display
        }
        // Only convert if source is EUR and exchange rate is valid
        if (sourceCurrency && sourceCurrency.toUpperCase() === 'EUR' && eurToNgnRate && eurToNgnRate > 0) {
            return amount * eurToNgnRate;
        }
        return amount; // Otherwise, return as is (assumed NGN)
    }, [eurToNgnRate]);


    // Fetch flight details or use state from location
    useEffect(() => {
        const loadFlightData = async () => {
            setLoading(true);
            setError(null);

            // Prioritize flight data from location.state if available and complete
            if (location.state?.flightData && (location.state.flightData.externalApiId || location.state.flightData._id)) {
                console.log('[FlightDetails] Using flight data from location.state:', location.state.flightData);
                setFlight(location.state.flightData);
                setLoading(false);
                return;
            }

            // If not from state, try fetching from backend if it's a known (dummy/DB) ID
            if (id && !id.startsWith('amadeus-')) { // Only attempt to fetch if it's a DB/dummy ID
                try {
                    console.log(`[FlightDetails] Attempting to fetch flight details from backend for ID: ${id}`);
                    const response = await axios.get(`${API_URL}/flights/${id}`);
                    setFlight(response.data);
                    console.log('[FlightDetails] Successfully fetched flight details:', response.data);
                } catch (err) {
                    console.error('Error fetching flight details from backend:', err);
                    const errorMsg = err.response?.data?.message || 'Failed to load flight details.';
                    setError(errorMsg);
                    toast.error(errorMsg);
                } finally {
                    setLoading(false);
                }
            } else if (id && id.startsWith('amadeus-')) {
                // For Amadeus IDs, if not in location.state, we can't reliably re-fetch by ID alone.
                // It means the user likely refreshed the page directly on an Amadeus flight details URL.
                setError("Flight details for external (Amadeus) offers cannot be re-fetched directly after a page refresh. Please go back to search for new offers.");
                toast.error("External flight details lost. Please search again.");
                setLoading(false);
            } else {
                // No ID or data, just set loading to false.
                setLoading(false);
                setError("No flight ID or data provided. Please select a flight from the search results.");
            }
        };

        loadFlightData();
    }, [id, location.state]);


    // Recalculate total price when flight data, numberOfSeats, or eurToNgnRate changes
    useEffect(() => {
        if (flight && eurToNgnRate !== null) { // Ensure flight and exchange rate are loaded
            let perPersonBasePrice = 0;

            // Get the per-person base price from the flight object (in its original currency)
            // The backend's realFlightController now provides 'totalPrice' as per-person.
            if (flight.totalPrice !== undefined && flight.totalPrice !== null) {
                perPersonBasePrice = parseFloat(flight.totalPrice);
            } else if (flight.price !== undefined && flight.price !== null) { // Fallback for dummy DB flights
                perPersonBasePrice = parseFloat(flight.price);
            } else if (isRoundTripDisplay && flight.outboundFlight && flight.returnFlight) {
                // Fallback for deeply nested Amadeus offers if totalPrice isn't at top level,
                // and outbound/return flights have their own per-person prices.
                perPersonBasePrice = parseFloat(flight.outboundFlight.price || 0) + parseFloat(flight.returnFlight.price || 0);
            }

            // Convert this per-person base price to NGN using the helper
            const perPersonPriceInNaira = convertAmountForDisplay(perPersonBasePrice, flight.currency);
            
            // Calculate the total price for all selected seats
            const calculatedPrice = perPersonPriceInNaira * numberOfSeats;
            setTotalPrice(calculatedPrice);
        }
    }, [numberOfSeats, flight, isRoundTripDisplay, eurToNgnRate, convertAmountForDisplay]);


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

        // IMPORTANT: Ensure 'flight' object is fully loaded before proceeding
        if (!flight || (isRoundTripDisplay && (!flight.outboundFlight || !flight.returnFlight)) || (!isRoundTripDisplay && !flight.segments)) {
            toast.error('Flight details are not fully loaded. Please wait or refresh the page and try again.');
            console.error('[FlightDetails] Booking initiation failed: flight object is incomplete.', flight);
            return;
        }

        let availableSeatsForBooking;
        if (isRoundTripDisplay) {
            availableSeatsForBooking = Math.min(flight.outboundFlight.availableSeats || 0, flight.returnFlight.availableSeats || 0);
        } else {
            availableSeatsForBooking = flight.availableSeats || 0;
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

        // Placeholder passenger data - ideally, you'd collect this from a form
        const passengersData = Array.from({ length: requestedSeats }).map((_, index) => ({
            firstName: user.firstName || `Guest${index + 1}`,
            lastName: user.lastName || 'Passenger',
            gender: 'Other', // You might want to allow user to select this
            dateOfBirth: new Date('1990-01-01').toISOString(), // User input required for production
            nationality: user.address?.country || 'Unknown', // User input required for production
        }));

        // Send the full flight objects to the backend
        const bookingPayload = {
            // CRITICAL FIX: Explicitly pass externalApiId from the top-level flight object
            // to both outboundFlightDetails and returnFlightDetails for round trips.
            outboundFlightDetails: isRoundTripDisplay ? { ...flight.outboundFlight, externalApiId: flight.externalApiId } : flight,
            returnFlightDetails: isRoundTripDisplay ? { ...flight.returnFlight, externalApiId: flight.externalApiId } : null,
            bookingType: isRoundTripDisplay ? 'round-trip' : 'one-way',
            passengers: passengersData,
        };

        console.log('[FlightDetails] Sending booking payload to backend:', JSON.stringify(bookingPayload, null, 2));


        setBookingInProgress(true);
        toast.info('Initiating booking. Please wait for payment prompt...');

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            // The backend's createBooking will calculate the totalAmount based on the received flightDetails
            // and the number of passengers, and perform any necessary currency conversions to NGN.
            const response = await axios.post(`${API_URL}/bookings`, bookingPayload, config);

            const { paystackReference, totalAmount, userEmail, booking } = response.data;

            if (!paystackReference || totalAmount === undefined || userEmail === undefined || !booking) {
                throw new Error('Backend did not return required payment details.');
            }

            setPaystackConfig({
                reference: paystackReference,
                email: userEmail,
                amount: Math.round(totalAmount * 100), // Amount in kobo (totalAmount from backend should already be in NGN)
                publicKey: PAYSTACK_PUBLIC_KEY,
                metadata: {
                    bookingId: booking._id,
                    bookingType: 'flight',
                },
            });

            setShowPaystackButton(true);

        } catch (err) {
            setBookingInProgress(false);
            console.error('Error initiating booking:', err);
            const errMsg = err.response?.data?.message || 'Failed to initiate booking. Please try again.';
            toast.error(errMsg);
        }
    };

    const handlePaystackSuccess = async (response) => {
        console.log('Paystack Success Response:', response);
        setShowPaystackButton(false);
        setBookingInProgress(false);

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
                const requestedSeats = parseInt(numberOfSeats, 10);

                // Update available seats on the current `flight` object in state
                // This ensures the displayed available seats are decremented immediately
                setFlight(prevFlight => {
                    if (!prevFlight) return null;
                    if (isRoundTripDisplay) {
                        return {
                            ...prevFlight,
                            outboundFlight: {
                                ...prevFlight.outboundFlight,
                                availableSeats: (prevFlight.outboundFlight.availableSeats || 0) - requestedSeats
                            },
                            returnFlight: {
                                ...prevFlight.returnFlight,
                                availableSeats: (prevFlight.returnFlight.availableSeats || 0) - requestedSeats
                            }
                        };
                    } else {
                        return {
                            ...prevFlight,
                            availableSeats: (prevFlight.availableSeats || 0) - requestedSeats
                        };
                    }
                });

                setNumberOfSeats(1); // Reset seats to 1 after successful booking

                setTimeout(() => {
                    navigate('/my-bookings');
                }, 2000);
            } else {
                toast.warn('Payment verified, but booking status could not be confirmed. Please check your bookings or contact support.');
            }

        } catch (error) {
            console.error('Error during payment verification:', error);
            const errMsg = error.response?.data?.message || 'Payment verification failed. Please check your bookings or contact support.';
            toast.error(errMsg);
        }
    };

    const handlePaystackClose = () => {
        console.log('Paystack payment modal closed by user.');
        setShowPaystackButton(false);
        setBookingInProgress(false);
        toast.info('Payment cancelled by user. Please try again if you wish to book.');
    };

    // Show loading spinner for flight details and currency rate
    if (loading || currencyRateLoading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Spinner size="lg" color="indigo" />
                <p className="text-xl text-gray-600 mt-4 animate-pulse">
                    {currencyRateLoading ? 'Fetching currency rates...' : 'Fetching flight details...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg shadow-lg">
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/flights" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="inline-block mr-2" /> Back to Flight Search
                </Link>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gray-100 p-4">
                <p className="text-xl text-gray-600">Flight data not found. Please go back and try again.</p>
                <Link to="/flights" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="inline-block mr-2" /> Go Back to Search
                </Link>
            </div>
        );
    }

    // Determine current available seats for display and validation
    const currentAvailableSeats = isRoundTripDisplay
        ? Math.min(flight.outboundFlight.availableSeats || 0, flight.returnFlight.availableSeats || 0)
        : flight.availableSeats || 0; // Use 0 as fallback if availableSeats is undefined/null


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Plane size={40} className="text-blue-600 mr-3" /> Flight Details
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Outbound Flight Details */}
                {isRoundTripDisplay ? (
                    renderLegSegments(flight.outboundFlight, 'Outbound Journey Details', 'text-indigo-600')
                ) : (
                    // For one-way flights, the 'flight' object itself is the single leg
                    renderLegSegments(flight, 'Flight Itinerary Details', 'text-indigo-600')
                )}

                {/* Return Flight Details (Conditionally rendered) */}
                {isRoundTripDisplay && renderLegSegments(flight.returnFlight, 'Return Journey Details', 'text-green-600')}
            </div>

            {/* Booking Summary and Form Section */}
            <div className="bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-[1.005] border border-indigo-200">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {isRoundTripDisplay ? 'Complete Your Round Trip Booking' : 'Book Your One-Way Flight'}
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
                                    disabled={bookingInProgress}
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
                                            <CreditCard size={24} className="mr-3 group-hover:rotate-6 transition-transform" />
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
                            This {isRoundTripDisplay ? 'journey' : 'flight'} is currently fully booked.
                        </p>
                    )
                ) : (
                    <p className="text-center text-gray-700 text-lg py-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                        Please <Link to="/login" className="text-indigo-600 hover:underline font-semibold">log in</Link> to book this {isRoundTripDisplay ? 'journey' : 'flight'}.
                    </p>
                )}
            </div>

            {/* Back to Flights Button */}
            <div className="text-center mt-12">
                <Link to="/flights" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="mr-2" /> Back to All Flights
                </Link>
            </div>
        </div>
    );
}

export default FlightDetails;
