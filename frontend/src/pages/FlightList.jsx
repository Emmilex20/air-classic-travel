// frontend/src/pages/FlightList.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

// Import icons from lucide-react
import {
    PlaneTakeoff,     // For departure airport
    PlaneLanding,     // For arrival airport
    Calendar,         // For dates
    ArrowRight,       // For direction in flight card
    DollarSign,       // For price
    Armchair,         // For seats
    Search,           // For search button
    XCircle,          // For clear search button
    Edit,             // For edit button
    Trash2,           // For delete button
    CircleDot,        // For one-way radio
    Circle            // For round-trip radio
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// NEW: Helper function for currency formatting
const formatCurrency = (amount) => {
    // Assuming Nigerian Naira (NGN) and Nigerian locale for formatting
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN', // Using NGN to get the ₦ symbol
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

function FlightList() {
    const { user, token } = useContext(AuthContext);
    const location = useLocation();

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for search form inputs
    const [departureAirport, setDepartureAirport] = useState('');
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [tripType, setTripType] = useState('one-way');

    const canManageFlights = user && (user.roles.includes('admin') || user.roles.includes('airline_staff'));

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (departureAirport) params.append('departureAirport', departureAirport);
        if (arrivalAirport) params.append('arrivalAirport', arrivalAirport);
        if (departureDate) params.append('departureDate', departureDate);
        params.append('tripType', tripType); // Always send tripType

        if (tripType === 'round-trip' && returnDate) {
            params.append('returnDate', returnDate);
        }
        return params.toString();
    };

    const fetchFlights = async (queryParams = '') => {
        try {
            setLoading(true);
            setError('');
            const url = `${API_URL}/flights?${queryParams}`;
            const response = await axios.get(url);
            setFlights(response.data);
            if (response.data.length === 0 && queryParams) {
                toast.info("No flights found matching your search criteria.");
            }
        } catch (err) {
            console.error('Error fetching flights:', err);
            const errorMsg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to load flights.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const depAirport = params.get('departureAirport') || '';
        const arrAirport = params.get('arrivalAirport') || '';
        const depDate = params.get('departureDate') || '';
        const retDate = params.get('returnDate') || '';
        const type = params.get('tripType') || 'one-way';

        setDepartureAirport(depAirport);
        setArrivalAirport(arrAirport);
        setDepartureDate(depDate);
        setReturnDate(retDate);
        setTripType(type);

        fetchFlights(params.toString());
    }, [location.search]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = buildQueryParams();
        window.history.pushState(null, '', `/flights?${params}`);
        fetchFlights(params);
    };

    const handleClearSearch = () => {
        setDepartureAirport('');
        setArrivalAirport('');
        setDepartureDate('');
        setReturnDate('');
        setTripType('one-way');
        window.history.pushState(null, '', `/flights`);
        fetchFlights(''); // Fetch all flights again
        toast.info("Search filters cleared.");
    };

    const handleDelete = async (flightId) => {
        // Use toast.info with custom content for better UI than window.confirm
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2">Are you sure you want to delete this flight?</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                try {
                                    const config = { headers: { Authorization: `Bearer ${token}` } };
                                    await axios.delete(`${API_URL}/flights/${flightId}`, config);
                                    toast.success('Flight deleted successfully!');
                                    fetchFlights(buildQueryParams()); // Re-fetch
                                } catch (err) {
                                    console.error('Error deleting flight:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to delete flight.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast(); // Close the confirmation toast
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

    const getMinDate = (dateString = '') => {
        let date = new Date();
        if (dateString) {
            date = new Date(dateString);
        }
        date.setDate(date.getDate());
        return date.toISOString().split('T')[0];
    };

    const getMinReturnDate = () => {
        if (!departureDate) return getMinDate();
        const dep = new Date(departureDate);
        dep.setDate(dep.getDate() + 1);
        return dep.toISOString().split('T')[0];
    };


    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600 animate-pulse">Loading amazing flights for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down">Discover Your Next Journey</h1>

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
                                checked={tripType === 'one-way'}
                                onChange={(e) => {
                                    setTripType(e.target.value);
                                    setReturnDate(''); // Clear return date if switching to one-way
                                }}
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
                                checked={tripType === 'round-trip'}
                                onChange={(e) => setTripType(e.target.value)}
                                className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-colors duration-200"
                            />
                            <span className="ml-2 flex items-center">
                                <Circle size={18} className="mr-1" /> Round-Trip
                            </span>
                        </label>
                    </div>

                    {/* Search Inputs with Icons */}
                    <InputGroup label="From (Airport Code)" id="departureAirport" placeholder="e.g., LOS" value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())} icon={PlaneTakeoff} />
                    <InputGroup label="To (Airport Code)" id="arrivalAirport" placeholder="e.g., JFK" value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())} icon={PlaneLanding} />
                    <InputGroup label="Departure Date" id="departureDate" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={getMinDate()} icon={Calendar} required />
                    
                    {tripType === 'round-trip' && (
                        <InputGroup label="Return Date" id="returnDate" type="date" placeholder="Select date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={getMinReturnDate()} icon={Calendar} required={tripType === 'round-trip'} />
                    )}
                    
                    {/* Search and Clear Buttons */}
                    <div className={`md:col-span-2 lg:col-span-1 ${tripType === 'round-trip' ? 'xl:col-span-1' : 'xl:col-span-2'} flex space-x-4 mt-4 md:mt-0`}>
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

            {/* Display Flights */}
            {flights.length === 0 && !loading && !error ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md text-gray-600">
                    <img src="https://placehold.co/100x100/E0E7FF/6366F1?text=No+Flights" alt="No flights found" className="mb-4" />
                    <p className="text-xl font-semibold mb-2">No flights found for your criteria.</p>
                    <p className="text-md text-gray-500">Try adjusting your dates or destinations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {flights.map((item) => (
                        item.outboundFlight && item.returnFlight ? (
                            // Round-Trip Combination Card
                            <FlightCardRoundTrip
                                key={item.outboundFlight._id + item.returnFlight._id}
                                outboundFlight={item.outboundFlight}
                                returnFlight={item.returnFlight}
                                totalPrice={item.totalPrice}
                                // The Link here is just a placeholder, real booking would go to a dedicated form
                                bookLink={`/flights/${item.outboundFlight._id}?returnFlightId=${item.returnFlight._id}`}
                            />
                        ) : (
                            // One-Way Flight Card
                            <FlightCardOneWay
                                key={item._id}
                                flight={item}
                                canManageFlights={canManageFlights}
                                onDelete={() => handleDelete(item._id)}
                            />
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

// Reusable Input Group Component with Icon
const InputGroup = ({ label, id, type = 'text', placeholder, value, onChange, min, required = false, icon: Icon }) => (
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
);

// Reusable One-Way Flight Card Component
const FlightCardOneWay = ({ flight, canManageFlights, onDelete }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
        {/* Header */}
        <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
            <img src={`https://www.google.com/s2/favicons?domain=${flight.airline.toLowerCase().replace(/\s/g, '')}.com&sz=64`} alt={flight.airline} className="h-8 w-8 mr-3 rounded-full border border-gray-200 p-1" onError={(e)=>{e.target.onerror=null; e.target.src=`https://placehold.co/64x64/E0E7FF/6366F1?text=${flight.airline.substring(0,1)}`}}/>
            <h3 className="text-xl font-bold text-indigo-700">{flight.airline} - {flight.flightNumber}</h3>
        </div>

        {/* Flight Details */}
        <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm mb-4">
            <FlightDetailItem label="From" value={flight.departureAirport} icon={PlaneTakeoff} />
            <FlightDetailItem label="To" value={flight.arrivalAirport} icon={PlaneLanding} />
            <FlightDetailItem label="Departure" value={new Date(flight.departureTime).toLocaleString()} icon={Calendar} />
            <FlightDetailItem label="Arrival" value={new Date(flight.arrivalTime).toLocaleString()} icon={Calendar} />
        </div>

        <div className="flex justify-between items-center mb-4">
            <p className="text-3xl font-extrabold text-green-700 flex items-center">
                <DollarSign size={24} className="mr-2" /> {formatCurrency(flight.price)}
            </p>
            <p className={`text-md font-semibold flex items-center ${flight.availableSeats > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                <Armchair size={20} className="mr-2" /> Seats: {flight.availableSeats}
            </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link
                to={`/flights/${flight._id}`}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            >
                View Details
            </Link>
            {canManageFlights && (
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
        </div>
    </div>
);

// Reusable Round-Trip Flight Card Component
const FlightCardRoundTrip = ({ outboundFlight, returnFlight, totalPrice, bookLink }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-3 border-b border-blue-100">Round Trip Journey</h2>
        <p className="text-xl font-extrabold text-green-700 flex items-center">
            <DollarSign size={24} className="mr-2" /> {formatCurrency(totalPrice)}
        </p>

        {/* Outbound Flight Section */}
        <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-3">
                <PlaneTakeoff size={20} className="mr-2 text-indigo-500" /> Outbound Flight
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-sm">
                <p><span className="font-semibold">Airline:</span> {outboundFlight.airline}</p>
                <p><span className="font-semibold">Flight No:</span> {outboundFlight.flightNumber}</p>
                <p className="col-span-2"><span className="font-semibold">Route:</span> {outboundFlight.departureAirport} <ArrowRight size={14} className="inline-block mx-1" /> {outboundFlight.arrivalAirport}</p>
                <p><span className="font-semibold">Departs:</span> {new Date(outboundFlight.departureTime).toLocaleString()}</p>
                <p><span className="font-semibold">Arrives:</span> {new Date(outboundFlight.arrivalTime).toLocaleString()}</p>
                <p><span className="font-semibold">Price:</span> {formatCurrency(outboundFlight.price)}</p>
                <p className={`font-semibold ${outboundFlight.availableSeats > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    <Armchair size={16} className="inline-block mr-1" /> Seats: {outboundFlight.availableSeats}
                </p>
            </div>
        </div>

        {/* Return Flight Section */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-3">
                <PlaneLanding size={20} className="mr-2 text-indigo-500" /> Return Flight
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-sm">
                <p><span className="font-semibold">Airline:</span> {returnFlight.airline}</p>
                <p><span className="font-semibold">Flight No:</span> {returnFlight.flightNumber}</p>
                <p className="col-span-2"><span className="font-semibold">Route:</span> {returnFlight.departureAirport} <ArrowRight size={14} className="inline-block mx-1" /> {returnFlight.arrivalAirport}</p>
                <p><span className="font-semibold">Departs:</span> {new Date(returnFlight.departureTime).toLocaleString()}</p>
                <p><span className="font-semibold">Arrives:</span> {new Date(returnFlight.arrivalTime).toLocaleString()}</p>
                <p><span className="font-semibold">Price:</span> {formatCurrency(returnFlight.price)}</p>
                <p className={`font-semibold ${returnFlight.availableSeats > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    <Armchair size={16} className="inline-block mr-1" /> Seats: {returnFlight.availableSeats}
                </p>
            </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
            <Link
                to={bookLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg text-md transition duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
            >
                Select This Round Trip
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    </div>
);

// Helper for consistent detail item display
const FlightDetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center text-gray-700">
        {Icon && <Icon size={16} className="mr-2 text-indigo-400" />}
        <span className="font-semibold mr-1">{label}:</span> {value}
    </div>
);

export default FlightList;