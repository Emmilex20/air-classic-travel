/* eslint-disable no-unused-vars */
// frontend/src/pages/FlightList.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

// Import the Spinner component
import Spinner from '../components/Spinner';
import AutocompleteInput from '../components/AutocompleteInput';

// Import icons from lucide-react
import {
    Plane,          // Main Plane icon for heading
    PlaneTakeoff,   // For departure airport / outbound flight
    PlaneLanding,   // For arrival airport / return flight
    Calendar,       // For dates
    ArrowRight,     // For direction in flight card, and 'Read More'
    DollarSign,     // For price
    Armchair,       // For seats / aircraft
    Search,         // For search button
    XCircle,        // For clear search button
    Edit,           // For edit button
    Trash2,         // For delete button
    CircleDot,      // For one-way radio
    Circle,         // For round-trip radio
    Clock,          // For duration / layover
    Hourglass,      // For total duration
    Info,           // For general info / segment info
    ChevronDown,    // For expand/collapse
    ChevronUp,      // For expand/collapse
    Users,          // For passenger count
    Tag,            // For travel class
    Ticket,         // For Amadeus offer ID
    Route,          // For journey/segment route
    DoorOpen,           // For gate number
    Building        // For terminal
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// SIMPLIFIED HELPER: This function now ONLY formats the amount.
// It assumes the amount passed to it is ALREADY in NGN.
const formatCurrency = (amount) => {
    // If amount is NaN or null/undefined, return a friendly message
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'N/A'; // Or 'Invalid Price'
    }
    
    return new Intl.NumberFormat('en-NG', { // Always format as NGN
        style: 'currency',
        currency: 'NGN', // Target currency is NGN
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount); // Formats the already NGN amount
};

// Helper to parse Amadeus duration (e.g., "PT10H35M" to minutes)
const parseDurationToMinutes = (duration) => {
    if (!duration) return null;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    return (hours * 60) + minutes;
};

function FlightList() {
    const { user, token } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [expandedFlightId, setExpandedFlightId] = useState(null);

    // State to store currency exchange rate (EUR to NGN)
    const [eurToNgnRate, setEurToNgnRate] = useState(null);
    const [currencyRateLoading, setCurrencyRateLoading] = useState(true);

    const [searchParams, setSearchParams] = useState({
        origin: '',
        destination: '',
        date: '',
        tripType: 'one-way',
        returnDate: '',
        adults: 1,
        children: 0,
        infants: 0,
        travelClass: 'ECONOMY',
        maxPrice: '',
    });

    const canManageFlights = user && (user.roles.includes('admin') || user.roles.includes('airline_staff'));

    // Effect to fetch/simulate currency exchange rate on component mount
    useEffect(() => {
        const fetchExchangeRate = async () => {
            setCurrencyRateLoading(true);
            try {
                // FOR DEMONSTRATION: This must match the backend's fixed rate
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                setEurToNgnRate(1600); // FIXED: Ensure this matches backend EUR_TO_NGN_EXCHANGE_RATE
                console.log("Simulated EUR to NGN exchange rate set: 1600");
            } catch (err) {
                console.error("Error fetching exchange rate:", err);
                toast.error("Failed to load currency exchange rate.");
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


    const handleSearchParamChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value
        }));
    }, []);

    // Handler for AutocompleteInput specifically
    const handleAutocompleteChange = useCallback((name, iataCode) => {
        setSearchParams(prev => ({
            ...prev,
            [name]: iataCode // This will set the IATA code directly
        }));
    }, []);


    const handleTripTypeChange = useCallback((e) => {
        const newTripType = e.target.value;
        setSearchParams(prev => ({
            ...prev,
            tripType: newTripType,
            returnDate: newTripType === 'one-way' ? '' : prev.returnDate
        }));
    }, []);

    const getMinDate = useCallback((dateString = '') => {
        let date = new Date();
        if (dateString) {
            date = new Date(dateString);
        }
        date.setDate(date.getDate());
        return date.toISOString().split('T')[0];
    }, []);

    const getMinReturnDate = useCallback(() => {
        if (!searchParams.date) return getMinDate();
        const dep = new Date(searchParams.date);
        dep.setDate(dep.getDate() + 1);
        return dep.toISOString().split('T')[0];
    }, [searchParams.date, getMinDate]);


    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams();
        for (const key in searchParams) {
            // Only include non-empty, non-null, non-undefined values
            if (searchParams[key] !== '' && searchParams[key] !== null && searchParams[key] !== undefined) {
                 // Ensure travelClass is uppercase for Amadeus API (origin/destination are handled by AutocompleteInput now)
                if (key === 'travelClass') {
                     params.append(key, String(searchParams[key]).toUpperCase());
                } else {
                    params.append(key, searchParams[key]);
                }
            }
        }
        if (searchParams.tripType === 'one-way') {
            params.delete('returnDate');
        }
        return params.toString();
    }, [searchParams]);

    const fetchFlights = useCallback(async (queryParamsString) => {
        try {
            setLoading(true);
            setError('');
            
            const url = `${API_URL}/flights?${queryParamsString}`;
            const response = await axios.get(url);
            setFlights(response.data);

            if (response.data.length === 0) {
                toast.info("No flights found matching your search criteria.");
            }
        } catch (err) {
            console.error('Error fetching flights:', err);
            const errorMsg = err.response?.data?.message || 'Failed to load flights.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
            setSearchPerformed(true);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Set searchParams state from URL on initial load or URL change
        setSearchParams({
            origin: params.get('origin') || '',
            destination: params.get('destination') || '',
            date: params.get('date') || '',
            tripType: params.get('tripType') || 'one-way',
            returnDate: params.get('returnDate') || '',
            adults: parseInt(params.get('adults') || '1', 10),
            children: parseInt(params.get('children') || '0', 10),
            infants: parseInt(params.get('infants') || '0', 10),
            travelClass: params.get('travelClass') || 'ECONOMY',
            maxPrice: params.get('maxPrice') || '',
        });

        const hasRequiredParams = params.get('origin') && params.get('destination') && params.get('date');
        if (hasRequiredParams) {
            fetchFlights(location.search.substring(1));
        } else {
            setLoading(false);
            setError('');
            setSearchPerformed(false);
            setFlights([]);
        }
    }, [location.search, fetchFlights]);


    const handleSearch = (e) => {
        e.preventDefault();
        const params = buildQueryParams();
        // Check if required origin/destination have valid IATA codes after potential autocomplete
        if (!searchParams.origin || searchParams.origin.length !== 3 || !searchParams.destination || searchParams.destination.length !== 3) {
            toast.error("Please select valid 3-letter airport codes for origin and destination from the suggestions.");
            return;
        }

        navigate(`/flights?${params}`);
    };

    const handleClearSearch = useCallback(() => {
        setSearchParams({
            origin: '',
            destination: '',
            date: '',
            tripType: 'one-way',
            returnDate: '',
            adults: 1,
            children: 0,
            infants: 0,
            travelClass: 'ECONOMY',
            maxPrice: '',
        });
        navigate(`/flights`);
        setFlights([]);
        setSearchPerformed(false);
        toast.info("Search filters cleared.");
    }, [navigate]);

    const handleDelete = async (flightId) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2">Are you sure you want to delete this flight?</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                try {
                                    if (flightId.startsWith('amadeus-')) {
                                        toast.warn('Amadeus flight offers cannot be deleted via this interface. They are search results, not stored entities.');
                                        closeToast();
                                        return;
                                    }
                                    const config = { headers: { Authorization: `Bearer ${token}` } };
                                    await axios.delete(`${API_URL}/flights/${flightId}`, config);
                                    toast.success('Flight deleted successfully!');
                                    fetchFlights(buildQueryParams());
                                } catch (err) {
                                    console.error('Error deleting flight:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to delete flight.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast();
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    const handleFlightClick = useCallback((flight) => {
        navigate(`/flights/${flight._id}`, { state: { flightData: flight } });
    }, [navigate]);

    const toggleFlightDetails = useCallback((flightId) => {
        setExpandedFlightId(expandedFlightId === flightId ? null : flightId);
    }, [expandedFlightId]);

    // Show loading spinner for currency rate as well
    if (loading || currencyRateLoading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center flex-col bg-gray-100">
                <Spinner size="lg" color="indigo" />
                <p className="text-xl text-gray-600 mt-4 animate-pulse">
                    {currencyRateLoading ? 'Fetching currency rates...' : 'Loading amazing flights for you...'}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-red-50 p-4 rounded-lg shadow-lg">
                <XCircle size={48} className="text-red-700 mb-4" />
                <p className="text-xl text-red-700 font-semibold mb-4">{error}</p>
                <Link to="/" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Search
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Plane size={40} className="text-blue-600 mr-3" /> Discover Your Next Journey
            </h1>

            {/* Flight Search Form - Enhanced */}
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-10 border border-indigo-200 transform transition-transform duration-300 hover:scale-[1.005]">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Flight</h2>
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-end">
                    {/* Trip Type Radios */}
                    <div className="md:col-span-2 lg:col-span-4 xl:col-span-5 flex justify-center space-x-6 mb-4">
                        <label className="flex items-center text-gray-700 font-medium cursor-pointer transition-colors duration-200 hover:text-indigo-600">
                            <input
                                type="radio"
                                name="tripType"
                                value="one-way"
                                checked={searchParams.tripType === 'one-way'}
                                onChange={handleTripTypeChange}
                                className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-colors duration-200"
                            />
                            <span className="ml-2 flex items-center">
                                <CircleDot size={18} className="mr-1" /> One-Way
                            </span>
                        </label>
                        <label className="flex items-center text-gray-700 font-medium cursor-pointer transition-colors duration-200 hover:text-indigo-600">
                            <input
                                type="radio"
                                name="tripType"
                                value="round-trip"
                                checked={searchParams.tripType === 'round-trip'}
                                onChange={handleTripTypeChange}
                                className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-colors duration-200"
                            />
                            <span className="ml-2 flex items-center">
                                <Circle size={18} className="mr-1" /> Round-Trip
                            </span>
                        </label>
                    </div>

                    {/* Autocomplete Inputs for Origin & Destination */}
                    <AutocompleteInput
                        label="From (Airport Code)"
                        id="origin"
                        placeholder="e.g., LOS"
                        value={searchParams.origin}
                        onChange={(iataCode) => handleAutocompleteChange('origin', iataCode)}
                        icon={PlaneTakeoff}
                    />
                    <AutocompleteInput
                        label="To (Airport Code)"
                        id="destination"
                        placeholder="e.g., JFK"
                        value={searchParams.destination}
                        onChange={(iataCode) => handleAutocompleteChange('destination', iataCode)}
                        icon={PlaneLanding}
                    />

                    {/* Date Inputs */}
                    <InputGroup label="Departure Date" id="date" type="date" value={searchParams.date} onChange={handleSearchParamChange} min={getMinDate()} icon={Calendar} required />
                    
                    {searchParams.tripType === 'round-trip' && (
                        <InputGroup label="Return Date" id="returnDate" type="date" placeholder="Select date" value={searchParams.returnDate} onChange={handleSearchParamChange} min={getMinReturnDate()} icon={Calendar} required={searchParams.tripType === 'round-trip'} />
                    )}

                    {/* Passenger Inputs */}
                    <InputGroup label="Adults (12+)" id="adults" type="number" value={searchParams.adults} onChange={handleSearchParamChange} min="1" icon={Users} />
                    <InputGroup label="Children (2-11)" id="children" type="number" value={searchParams.children} onChange={handleSearchParamChange} min="0" icon={Users} />
                    <InputGroup label="Infants (0-2)" id="infants" type="number" value={searchParams.infants} onChange={handleSearchParamChange} min="0" icon={Users} />
                    
                    {/* Travel Class Dropdown */}
                    <div>
                        <label htmlFor="travelClass" className="block text-sm font-medium text-gray-700 mb-1">Travel Class</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                id="travelClass"
                                name="travelClass"
                                value={searchParams.travelClass}
                                onChange={handleSearchParamChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            >
                                <option value="ECONOMY">Economy</option>
                                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                                <option value="BUSINESS">Business</option>
                                <option value="FIRST">First Class</option>
                            </select>
                        </div>
                    </div>

                    {/* Max Price Input */}
                    <InputGroup label="Max Price (NGN)" id="maxPrice" type="number" placeholder="e.g., 100000" value={searchParams.maxPrice} onChange={handleSearchParamChange} min="0" icon={DollarSign} />

                    {/* Search and Clear Buttons */}
                    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 flex space-x-4 mt-4 md:mt-0">
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            <Search size={20} className="mr-2" /> Search Flights
                        </button>
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="flex-1 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            <XCircle size={20} className="mr-2" /> Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Display Flights or No Search Message */}
            {searchPerformed && flights.length === 0 && !loading && !error ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md text-gray-600">
                    <img src="https://placehold.co/100x100/E0E7FF/6366F1?text=No+Flights" alt="No flights found" className="mb-4" />
                    <p className="text-xl font-semibold mb-2">No flights found for your criteria.</p>
                    <p className="text-md text-gray-500">Try adjusting your dates or destinations.</p>
                </div>
            ) : (!searchPerformed && !loading && !error) ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md text-gray-600">
                    <img src="https://placehold.co/100x100/E0E7FF/6366F1?text=Flight+Search" alt="Search illustration" className="mb-4" />
                    <p className="text-xl font-semibold mb-2">Enter your departure, arrival, and date to find flights!</p>
                    <p className="text-md text-gray-500">We'll show you the best options available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {flights.map((item) => (
                        item.outboundFlight && item.returnFlight ? (
                            <FlightCardRoundTrip
                                key={item._id}
                                flight={item}
                                isExpanded={expandedFlightId === item._id}
                                toggleExpand={() => toggleFlightDetails(item._id)}
                                onSelect={() => handleFlightClick(item)}
                                convertAmountForDisplay={convertAmountForDisplay} // Pass the new helper
                            />
                        ) : (
                            <FlightCardOneWay
                                key={item._id || `${item.flightNumber}-${item.departureTime}`}
                                flight={item}
                                canManageFlights={canManageFlights}
                                onDelete={() => handleDelete(item._id)}
                                isExpanded={expandedFlightId === item._id}
                                toggleExpand={() => toggleFlightDetails(item._id)}
                                onSelect={() => handleFlightClick(item)}
                                convertAmountForDisplay={convertAmountForDisplay} // Pass the new helper
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

// Reusable Input Group Component (for non-autocomplete inputs)
const InputGroup = React.memo(({ label, id, type = 'text', placeholder, value, onChange, min, required = false, icon: Icon }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {Icon && <Icon className="h-5 w-5 text-gray-400" />}
            </div>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                required={required}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
        </div>
    </div>
));


// Helper for consistent detail item display in cards
const FlightDetailItem = React.memo(({ label, value, icon: Icon }) => (
    <div className="flex items-center text-gray-700">
        {Icon && <Icon size={16} className="mr-2 text-indigo-400" />}
        <span className="font-semibold mr-1">{label}:</span> {value}
    </div>
));

// Helper for formatting duration
const calculateDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

// Helper for rendering segments
const renderSegments = (segments) => (
    <div className="space-y-3">
        {segments.map((segment, idx) => (
            <div key={`${segment.flightNumber}-${idx}`} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Info size={16} className="text-blue-500 mr-2" />
                    Segment {idx + 1} / {segments.length}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm">
                    <p><span className="font-medium">Airline:</span> {segment.airline} ({segment.airlineCode})</p>
                    <p><span className="font-medium">Flight No:</span> {segment.flightNumber}</p>
                    <p><span className="font-medium">Depart:</span> {format(parseISO(segment.departureTime), 'p')}</p>
                    <p><span className="font-medium">Arrive:</span> {segment.arrivalAirport} ({segment.arrivalAirportCode}) <span className="font-medium">@</span> {format(parseISO(segment.arrivalTime), 'p')}</p>
                    <p><span className="font-medium">Duration:</span> {calculateDuration(segment.durationMinutes)}</p>
                    <p><span className="font-medium">Aircraft:</span> {segment.aircraftType}</p>
                    {segment.departureTerminal && <p className="flex items-center"><DoorOpen size={14} className="mr-1 text-gray-500" /><span className="font-medium">Dep. Terminal:</span> {segment.departureTerminal}</p>}
                    {segment.arrivalTerminal && <p className="flex items-center"><Building size={14} className="mr-1 text-gray-500" /><span className="font-medium">Arr. Terminal:</span> {segment.arrivalTerminal}</p>}
                </div>
                {idx < segments.length - 1 && (
                    <div className="mt-4 border-t pt-3 border-dashed border-gray-300 text-center text-gray-600 text-sm">
                        <Clock size={16} className="inline-block mr-1" />
                        Layover in {segments[idx].arrivalAirport} ({segments[idx].arrivalAirportCode}) for {
                            calculateDuration(
                                (parseISO(segments[idx + 1].departureTime).getTime() - parseISO(segments[idx].arrivalTime).getTime()) / (1000 * 60)
                            )
                        }
                    </div>
                )}
            </div>
        ))}
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-indigo-800 text-sm font-semibold flex items-center justify-center">
            <Hourglass size={16} className="mr-2" /> Total Duration: {calculateDuration(segments[0]?.totalDurationMinutes || segments[0]?.durationMinutes)} {/* Use appropriate duration field */}
        </div>
    </div>
);


// Reusable One-Way Flight Card Component
const FlightCardOneWay = React.memo(({ flight, canManageFlights, onDelete, isExpanded, toggleExpand, onSelect, convertAmountForDisplay }) => {
    // Determine the flight details to show on the main card (first segment for Amadeus, or direct for dummy/DB)
    const displayFlight = flight.segments && flight.segments.length > 0 ? flight.segments[0] : flight;

    // Convert the price to NGN for display
    const priceInNgn = convertAmountForDisplay(flight.totalPrice || flight.price, flight.currency);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            {/* Header */}
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                {/* Airline Favicon - Fallback to Placeholder with Initial if favicon fails */}
                <img
                    src={`https://www.google.com/s2/favicons?domain=${displayFlight.airline.toLowerCase().replace(/\s/g, '')}.com&sz=64`}
                    alt={displayFlight.airline}
                    className="h-8 w-8 mr-3 rounded-full border border-gray-200 p-1"
                    onError={(e)=>{
                        e.target.onerror=null; // Prevent infinite loop if fallback also fails
                        const initials = displayFlight.airline.substring(0,1).toUpperCase();
                        e.target.src=`https://placehold.co/64x64/E0E7FF/6366F1?text=${initials}`;
                    }}
                />
                <h3 className="text-xl font-bold text-indigo-700">{displayFlight.airline} - {displayFlight.flightNumber}</h3>
                {flight.externalApiId && (
                    <span className="ml-auto text-xs font-medium text-gray-500 px-2 py-1 rounded-full bg-gray-100 flex items-center">
                        <Ticket size={14} className="mr-1" /> Amadeus
                    </span>
                )}
            </div>

            {/* Flight Details Summary */}
            <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm mb-4">
                <FlightDetailItem label="From" value={displayFlight.departureAirport} icon={PlaneTakeoff} />
                <FlightDetailItem label="To" value={displayFlight.arrivalAirport} icon={PlaneLanding} />
                <FlightDetailItem label="Departure" value={format(parseISO(displayFlight.departureTime), 'MMM dd,yyyy, p')} icon={Calendar} />
                <FlightDetailItem label="Arrival" value={format(parseISO(displayFlight.arrivalTime), 'MMM dd,yyyy, p')} icon={Calendar} />
                {flight.status && <FlightDetailItem label="Status" value={flight.status} icon={null} />}
                {displayFlight.aircraftType && <FlightDetailItem label="Aircraft" value={displayFlight.aircraftType} icon={Armchair} />}
                {flight.totalDurationMinutes && <FlightDetailItem label="Total Duration" value={calculateDuration(flight.totalDurationMinutes)} icon={Clock} />}
                {(flight.segments?.length > 1) && <FlightDetailItem label="Stops" value={flight.segments.length - 1} icon={Route} />}
            </div>

            <div className="flex justify-between items-center mb-4">
                <p className="text-3xl font-extrabold text-green-700 flex items-center">
                    <DollarSign size={24} className="mr-2" /> {formatCurrency(priceInNgn)}
                </p>
                <p className={`text-md font-semibold flex items-center ${flight.availableSeats > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    <Armchair size={20} className="mr-2" /> Seats: {flight.availableSeats}
                </p>
            </div>

            {/* Expand/Collapse Button for full itinerary */}
            <div className="px-5 pb-5 text-center">
                <button
                    onClick={toggleExpand}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center justify-center mx-auto"
                >
                    {isExpanded ? (
                        <>
                            Hide Full Itinerary <ChevronUp size={18} className="ml-1" />
                        </>
                    ) : (
                        <>
                            Show Full Itinerary <ChevronDown size={18} className="ml-1" />
                        </>
                    )}
                </button>
            </div>

            {/* Expanded Details Area */}
            {isExpanded && flight.segments && (
                <div className="bg-gray-50 p-5 pt-0 border-t border-gray-200 mt-4 rounded-b-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-3 mt-4 flex items-center">
                        <Route size={20} className="text-indigo-600 mr-2" /> Journey Segments
                    </h4>
                    {renderSegments(flight.segments)}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
                <button
                    onClick={() => onSelect(flight)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                >
                    View Details
                </button>
                {canManageFlights && (
                    <>
                        {!flight._id.startsWith('amadeus-') && (
                            <>
                                <Link
                                    to={`/flights/edit/${flight._id}`}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                >
                                    <Edit size={16} className="inline-block mr-1" /> Edit
                                </Link>
                                <button
                                    onClick={onDelete}
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out shadow-md hover:shadow-lg"
                                >
                                    <Trash2 size={16} className="inline-block mr-1" /> Delete
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

// Reusable Round-Trip Flight Card Component
const FlightCardRoundTrip = React.memo(({ flight, isExpanded, toggleExpand, onSelect, convertAmountForDisplay }) => {
    const { outboundFlight, returnFlight, totalPrice, currency } = flight;

    // Convert the total price to NGN for display
    const priceInNgn = convertAmountForDisplay(totalPrice, currency);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-3 border-b border-blue-100 flex items-center">
                Round Trip Journey
                {flight.externalApiId && (
                    <span className="ml-auto text-xs font-medium text-gray-500 px-2 py-1 rounded-full bg-gray-100 flex items-center">
                        <Ticket size={14} className="mr-1" /> Amadeus
                    </span>
                )}
            </h2>
            <p className="text-3xl font-extrabold text-green-700 flex items-center mb-4">
                <DollarSign size={24} className="mr-2" /> {formatCurrency(priceInNgn)}
            </p>

            {/* Outbound Flight Section Summary */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-3">
                    <PlaneTakeoff size={20} className="mr-2 text-indigo-500" /> Outbound Flight
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-sm">
                    <p><span className="font-semibold">Airline:</span> {outboundFlight.airline}</p>
                    <p><span className="font-semibold">Flight No:</span> {outboundFlight.flightNumber}</p>
                    <p className="col-span-2"><span className="font-semibold">Route:</span> {outboundFlight.departureAirport} <ArrowRight size={14} className="inline-block mx-1" /> {outboundFlight.arrivalAirport}</p>
                    <p><span className="font-semibold">Departs:</span> {format(parseISO(outboundFlight.departureTime), 'MMM dd,yyyy, p')}</p>
                    <p><span className="font-semibold">Arrives:</span> {format(parseISO(outboundFlight.arrivalTime), 'MMM dd,yyyy, p')}</p>
                    <p><span className="font-semibold">Total Duration:</span> {calculateDuration(outboundFlight.totalDurationMinutes)}</p>
                    {(outboundFlight.segments?.length > 1) && <p><span className="font-semibold">Stops:</span> {outboundFlight.segments.length - 1}</p>}
                </div>
            </div>

            {/* Return Flight Section Summary */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-3">
                    <PlaneLanding size={20} className="mr-2 text-indigo-500" /> Return Flight
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-sm">
                    <p><span className="font-semibold">Airline:</span> {returnFlight.airline}</p>
                    <p><span className="font-semibold">Flight No:</span> {returnFlight.flightNumber}</p>
                    <p className="col-span-2"><span className="font-semibold">Route:</span> {returnFlight.departureAirport} <ArrowRight size={14} className="inline-block mx-1" /> {returnFlight.arrivalAirport}</p>
                    <p><span className="font-semibold">Departs:</span> {format(parseISO(returnFlight.departureTime), 'MMM dd,yyyy, p')}</p>
                    <p><span className="font-semibold">Arrives:</span> {format(parseISO(returnFlight.arrivalTime), 'MMM dd,yyyy, p')}</p>
                    <p><span className="font-semibold">Total Duration:</span> {calculateDuration(returnFlight.totalDurationMinutes)}</p>
                    {(returnFlight.segments?.length > 1) && <p><span className="font-semibold">Stops:</span> {returnFlight.segments.length - 1}</p>}
                </div>
            </div>

            {/* Expand/Collapse Button for full itinerary */}
            <div className="px-5 pb-5 text-center mt-4">
                <button
                    onClick={toggleExpand}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center justify-center mx-auto"
                >
                    {isExpanded ? (
                        <>
                            Hide Full Itinerary <ChevronUp size={18} className="ml-1" />
                        </>
                    ) : (
                        <>
                            Show Full Itinerary <ChevronDown size={18} className="ml-1" />
                        </>
                    )}
                </button>
            </div>

            {/* Expanded Details Area */}
            {isExpanded && (outboundFlight.segments || returnFlight.segments) && (
                <div className="bg-gray-50 p-5 pt-0 border-t border-gray-200 mt-4 rounded-b-xl">
                    <h4 className="text-lg font-bold text-gray-800 mb-3 mt-4 flex items-center">
                        <Route size={20} className="text-indigo-600 mr-2" /> Outbound Journey Details
                    </h4>
                    {renderSegments(outboundFlight.segments)}

                    <h4 className="text-lg font-bold text-gray-800 mb-3 mt-8 flex items-center">
                        <Route size={20} className="text-green-600 mr-2" /> Return Journey Details
                    </h4>
                    {renderSegments(returnFlight.segments)}
                </div>
                )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
                <button
                    onClick={() => onSelect(flight)} // Pass the entire flight object
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-md transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                >
                    Select This Round Trip
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
});

export default FlightList;
