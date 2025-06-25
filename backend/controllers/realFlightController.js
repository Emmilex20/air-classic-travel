// backend/controllers/realFlightController.js
const axios = require('axios');
const Flight = require('../models/Flight'); // Assuming you have a Flight model for real flights

// Amadeus API base URLs
const AMADEUS_AUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_FLIGHT_SEARCH_URL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

// In-memory token storage (for development/testing only)
let amadeusAccessToken = null;
let amadeusTokenExpiry = 0; // Timestamp when token expires

// Function to get or refresh Amadeus access token
const getAmadeusAccessToken = async () => {
    // Check if token exists and is still valid (with a 5-second buffer)
    if (amadeusAccessToken && Date.now() < amadeusTokenExpiry - 5000) {
        console.log('[Amadeus Auth] Using existing valid access token.');
        return amadeusAccessToken;
    }

    console.log('[Amadeus Auth] Fetching new access token...');
    try {
        const response = await axios.post(
            AMADEUS_AUTH_URL,
            `grant_type=client_credentials&client_id=${process.env.AMADEUS_CLIENT_ID}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        amadeusAccessToken = response.data.access_token;
        // Amadeus returns expires_in in seconds, convert to milliseconds and add to current time
        amadeusTokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        console.log('[Amadeus Auth] Successfully obtained new access token. Expires in:', response.data.expires_in, 'seconds.');
        return amadeusAccessToken;
    } catch (error) {
        console.error('[Amadeus Auth] Error fetching Amadeus access token:', error.message);
        if (error.response) {
            console.error('[Amadeus Auth] Amadeus Auth API response error data:', JSON.stringify(error.response.data, null, 2));
            console.error('[Amadeus Auth] Amadeus Auth API response status:', error.response.status);
        }
        throw new Error('Failed to obtain Amadeus access token.');
    }
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

// Controller for searching flights
const getRealFlights = async (req, res) => {
    const { origin, destination, date, tripType, returnDate, adults = 1, children = 0, infants = 0, travelClass, maxPrice } = req.query;

    console.log(`[getRealFlights] Received search query: origin=${origin}, destination=${destination}, date=${date}, tripType=${tripType}, returnDate=${returnDate}, adults=${adults}, children=${children}, infants=${infants}, travelClass=${travelClass}, maxPrice=${maxPrice}`);

    if (!origin || !destination || !date) {
        console.log('[getRealFlights] Missing required query parameters: origin, destination, or date.');
        return res.status(400).json({ message: 'Origin, destination, and date are required query parameters.' });
    }

    let finalFlightsToReturn = [];
    const MAX_RETRIES = 1; // For token refresh scenario

    // Calculate total number of travelers from the request
    const numberOfTravelers = parseInt(adults, 10) + parseInt(children, 10) + parseInt(infants, 10);
    if (numberOfTravelers === 0) {
        res.status(400);
        throw new Error('At least one traveler (adult, child, or infant) is required.');
    }

    for (let retryCount = 0; retryCount <= MAX_RETRIES; retryCount++) {
        try {
            // 1. Get Amadeus Access Token
            const token = await getAmadeusAccessToken();

            const amadeusHeaders = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // 2. Prepare Amadeus Flight Offers Search Parameters
            const amadeusParams = {
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: date, // Format:YYYY-MM-DD
                adults: parseInt(adults, 10),
                children: parseInt(children, 10),
                infants: parseInt(infants, 10),
                'max': 10, // Increased max results to 10 for more options
                'nonStop': false, // Allow connecting flights to get more results
            };

            if (tripType === 'round-trip' && returnDate) {
                amadeusParams.returnDate = returnDate;
            }
            if (travelClass) { // Optional parameter
                amadeusParams.travelClass = travelClass.toUpperCase(); // Ensure uppercase for Amadeus
            }
            if (maxPrice) { // Optional parameter
                amadeusParams.maxPrice = parseInt(maxPrice, 10); // Ensure integer
            }

            // Remove 0-value child/infant parameters if they are not explicitly set by the user or are 0
            if (amadeusParams.children === 0) delete amadeusParams.children;
            if (amadeusParams.infants === 0) delete amadeusParams.infants;

            console.log('[Amadeus API] Calling Flight Offers Search with params:', amadeusParams);

            // 3. Make the Amadeus API call
            const amadeusResponse = await axios.get(AMADEUS_FLIGHT_SEARCH_URL, {
                headers: amadeusHeaders,
                params: amadeusParams,
            });

            const rawAmadeusFlights = amadeusResponse.data.data;
            const dictionaries = amadeusResponse.data.dictionaries; // Access dictionaries for airline/airport names
            console.log(`[Amadeus API] Raw flights fetched from Amadeus: ${rawAmadeusFlights ? rawAmadeusFlights.length : 0} offers.`);

            if (rawAmadeusFlights && rawAmadeusFlights.length > 0) {
                for (const offer of rawAmadeusFlights) {
                    // IMPORTANT: Calculate per-person price from the total offer price
                    // Ensure offer.price.grandTotal is treated as a number, defaulting to 0 if invalid
                    const rawGrandTotal = parseFloat(offer.price.grandTotal || '0');
                    // Avoid division by zero if for some reason numberOfTravelers becomes 0 (though already guarded)
                    const perPersonPrice = numberOfTravelers > 0 ? rawGrandTotal / numberOfTravelers : 0;


                    const outboundItinerary = offer.itineraries[0]; // First itinerary is outbound

                    // Helper to map segments for an itinerary
                    const mapSegments = (segments) => {
                        const mappedSegments = segments.map(segment => ({
                            flightNumber: segment.number,
                            airline: dictionaries.carriers[segment.carrierCode] || segment.carrierCode, // Use dictionary for full name
                            airlineCode: segment.carrierCode,
                            departureAirport: dictionaries.locations[segment.departure.iataCode]?.cityName || segment.departure.iataCode, // Use dictionary for city name
                            departureAirportCode: segment.departure.iataCode,
                            arrivalAirport: dictionaries.locations[segment.arrival.iataCode]?.cityName || segment.arrival.iataCode, // Use dictionary for city name
                            arrivalAirportCode: segment.arrival.iataCode,
                            departureTime: new Date(segment.departure.at),
                            arrivalTime: new Date(segment.arrival.at),
                            durationMinutes: parseDurationToMinutes(segment.duration), // Duration of individual segment
                            aircraftType: dictionaries.aircraft[segment.aircraft.code] || segment.aircraft.code, // Use dictionary for aircraft name
                            departureTerminal: segment.departure.terminal,
                            arrivalTerminal: segment.arrival.terminal,
                            numberOfStops: segments.length - 1, // Number of stops for this leg
                        }));
                        return mappedSegments;
                    };

                    const outboundMappedSegments = mapSegments(outboundItinerary.segments);

                    let returnMappedSegments = null;
                    if (tripType === 'round-trip' && offer.itineraries.length > 1) {
                        const returnItinerary = offer.itineraries[1]; // Second itinerary is return
                        returnMappedSegments = mapSegments(returnItinerary.segments);
                    }

                    // Calculate total duration for the *entire* itinerary (Amadeus provides this)
                    const totalOutboundDuration = parseDurationToMinutes(outboundItinerary.duration);
                    const totalReturnDuration = returnMappedSegments ? parseDurationToMinutes(offer.itineraries[1].duration) : null;

                    // Create the final flight object
                    const baseFlightData = {
                        _id: `amadeus-${offer.id}`, // Use offer ID for unique identification of the offer
                        externalApiId: offer.id,
                        totalPrice: perPersonPrice, // Store the per-person price for the entire offer
                        currency: offer.price.currency,
                        // Note: availableSeats is not provided per flight by Amadeus in search results usually
                        // It's numberOfBookableSeats per offer. We use a random number here for dummy purposes.
                        availableSeats: offer.numberOfBookableSeats || (Math.floor(Math.random() * 50) + 10), // Fallback if Amadeus doesn't provide this directly on offer
                        class: offer.travelClass || 'ECONOMY', // Default to ECONOMY if not specified
                        // Common dummy data if needed for display (Amadeus doesn't give them directly for offers)
                        capacity: 180, 
                        status: 'Scheduled', // Amadeus Search API doesn't provide live status
                        departureGate: null, 
                        arrivalGate: null,
                    };

                    if (tripType === 'round-trip' && returnMappedSegments) {
                        finalFlightsToReturn.push({
                            ...baseFlightData,
                            // Set nested flight objects
                            outboundFlight: {
                                segments: outboundMappedSegments,
                                totalDurationMinutes: totalOutboundDuration,
                                price: perPersonPrice, // Per-person price for outbound leg
                                flightNumber: outboundMappedSegments[0]?.flightNumber,
                                airline: outboundMappedSegments[0]?.airline,
                                airlineCode: outboundMappedSegments[0]?.airlineCode,
                                departureAirport: outboundMappedSegments[0]?.departureAirport,
                                arrivalAirport: outboundMappedSegments[outboundMappedSegments.length - 1]?.arrivalAirport,
                                departureTime: outboundMappedSegments[0]?.departureTime,
                                arrivalTime: outboundMappedSegments[outboundMappedSegments.length - 1]?.arrivalTime,
                                availableSeats: baseFlightData.availableSeats, // Use overall offer's available seats for both legs
                                currency: baseFlightData.currency,
                                class: baseFlightData.class,
                            },
                            returnFlight: {
                                segments: returnMappedSegments,
                                totalDurationMinutes: totalReturnDuration,
                                price: perPersonPrice, // Per-person price for return leg
                                flightNumber: returnMappedSegments[0]?.flightNumber,
                                airline: returnMappedSegments[0]?.airline,
                                airlineCode: returnMappedSegments[0]?.airlineCode,
                                departureAirport: returnMappedSegments[0]?.departureAirport,
                                arrivalAirport: returnMappedSegments[returnMappedSegments.length - 1]?.arrivalAirport,
                                departureTime: returnMappedSegments[0]?.departureTime,
                                arrivalTime: returnMappedSegments[returnMappedSegments.length - 1]?.arrivalTime,
                                availableSeats: baseFlightData.availableSeats, // Use overall offer's available seats for both legs
                                currency: baseFlightData.currency,
                                class: baseFlightData.class,
                            },
                            // The `totalPrice` on the top level `flightResult` already represents the per-person offer total.
                            // The `price` fields within `outboundFlight` and `returnFlight` will also be per-person.
                        });
                    } else if (tripType === 'one-way') {
                        finalFlightsToReturn.push({
                            ...baseFlightData,
                            segments: outboundMappedSegments,
                            totalDurationMinutes: totalOutboundDuration,
                            // For one-way, `price` is already on `baseFlightData` which is per-person
                            flightNumber: outboundMappedSegments[0]?.flightNumber,
                            airline: outboundMappedSegments[0]?.airline,
                            airlineCode: outboundMappedSegments[0]?.airlineCode,
                            departureAirport: outboundMappedSegments[0]?.departureAirport,
                            arrivalAirport: outboundMappedSegments[outboundMappedSegments.length - 1]?.arrivalAirport,
                            departureTime: outboundMappedSegments[0]?.departureTime,
                            arrivalTime: outboundMappedSegments[outboundMappedSegments.length - 1]?.arrivalTime,
                            durationMinutes: totalOutboundDuration, // Total duration for the single leg
                        });
                    }
                }
                console.log('[Amadeus API] Successfully mapped Amadeus flight offers. Final flights to return:', finalFlightsToReturn.length);
            } else {
                console.warn("[Amadeus API] No real flights found for the query. Falling back to dummy data.");
            }
            break; // Break out of retry loop if successful

        } catch (error) {
            console.error('[getRealFlights] Error fetching real flights from Amadeus API:', error.message);
            if (error.response) {
                console.error('[getRealFlights] Amadeus API response error data:', JSON.stringify(error.response.data, null, 2));
                console.error('[getRealFlights] Amadeus API response status:', error.response.status);
                
                // Token refresh scenario
                if (error.response.status === 401 && retryCount === 0) {
                    console.log('[getRealFlights] Token potentially expired or invalid. Retrying with a new token...');
                    amadeusAccessToken = null; // Invalidate current token to force refresh
                    continue; // Retry the loop
                }

                let userMessage = 'Failed to fetch flights. Please try adjusting your search.';
                if (error.response.status === 400 && error.response.data?.errors) {
                    userMessage = `Error from Amadeus: ${error.response.data.errors.map(err => err.detail || err.title).join(', ')}`;
                } else if (error.response.status === 401 || error.response.status === 403) {
                    userMessage = "Authentication failed with Amadeus. Check your Client ID and Secret or API key.";
                } else if (error.response.status === 429) {
                    userMessage = "Too many requests to Amadeus API. Please wait a moment and try again.";
                } else if (error.response.status === 404) {
                    userMessage = `Could not find flights for the specified criteria from Amadeus. Original message: ${error.response.data.message || 'Not Found'}`;
                }
                // If it's a 401 and we've already retried, or any other error, send response
                res.status(error.response.status).json({ message: userMessage });
                return; // Exit the function after sending error response
            } else if (error.request) {
                console.error('[getRealFlights] No response received from Amadeus API:', error.request);
                res.status(503).json({ message: 'No response from external flight API (Amadeus). Please check your internet connection or try again later.' });
                return;
            } else {
                console.error('[getRealFlights] Error setting up Amadeus API request:', error.message);
                res.status(500).json({ message: 'Internal server error. Could not prepare external API request.' });
                return;
            }
        }
    }

    // --- Fallback: Generate dummy data if no real flights are found from Amadeus ---
    if (finalFlightsToReturn.length === 0) {
        console.warn("[getRealFlights] Amadeus API returned no flights for the query even after retries. Generating dummy data for demonstration.");

        const generateDummyFlightObject = (isReturn = false, currentReqOrigin, currentReqDestination, currentReqDate) => {
            const baseFlight = {
                flightNumber: `DM${Math.floor(Math.random() * 900) + 100}`,
                airline: 'Dummy Air',
                airlineCode: 'DUM',
                capacity: 180,
                availableSeats: Math.floor(Math.random() * 100) + 50,
                price: parseFloat((Math.random() * (150000 - 50000) + 50000).toFixed(2)), // Per-person price for dummy
                aircraftType: 'Boeing 737 (Simulated)',
                status: 'Scheduled',
                departureGate: `G${Math.floor(Math.random() * 20) + 1}`,
                departureTerminal: 'T1',
                arrivalGate: `G${Math.floor(Math.random() * 20) + 1}`,
                arrivalTerminal: 'T2',
                durationMinutes: 180, // Fixed dummy duration
                currency: 'NGN', // Dummy flights are NGN
                class: 'ECONOMY', // Default class
            };

            const targetDate = isReturn ? currentReqDate : currentReqDate;

            const d = new Date(targetDate);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            if (isReturn) {
                return {
                    _id: `dummy-return-${currentReqDestination}-${currentReqOrigin}-${year}-${month}-${day}-${baseFlight.flightNumber}`,
                    externalApiId: `dummy-return-${currentReqDestination}-${currentReqOrigin}-${year}-${month}-${day}-${baseFlight.flightNumber}`, // For consistency
                    departureAirport: currentReqDestination,
                    arrivalAirport: currentReqOrigin,
                    departureAirportCode: currentReqDestination, // For consistency with schema
                    arrivalAirportCode: currentReqOrigin, // For consistency with schema
                    departureTime: new Date(`${targetDate}T14:00:00Z`),
                    arrivalTime: new Date(`${targetDate}T17:00:00Z`),
                    ...baseFlight,
                    segments: [{ // Dummy segment for consistency
                        flightNumber: baseFlight.flightNumber,
                        airline: baseFlight.airline,
                        airlineCode: baseFlight.airlineCode,
                        departureAirport: currentReqDestination,
                        departureAirportCode: currentReqDestination,
                        departureTime: new Date(`${targetDate}T14:00:00Z`),
                        arrivalAirport: currentReqOrigin,
                        arrivalAirportCode: currentReqOrigin,
                        arrivalTime: new Date(`${targetDate}T17:00:00Z`),
                        durationMinutes: baseFlight.durationMinutes,
                        aircraftType: baseFlight.aircraftType,
                        departureTerminal: baseFlight.departureTerminal,
                        arrivalTerminal: baseFlight.arrivalTerminal,
                        numberOfStops: 0,
                    }],
                    totalDurationMinutes: baseFlight.durationMinutes,
                };
            } else {
                return {
                    _id: `dummy-outbound-${currentReqOrigin}-${currentReqDestination}-${year}-${month}-${day}-${baseFlight.flightNumber}`,
                    externalApiId: `dummy-outbound-${currentReqOrigin}-${currentReqDestination}-${year}-${month}-${day}-${baseFlight.flightNumber}`, // For consistency
                    departureAirport: currentReqOrigin,
                    arrivalAirport: currentReqDestination,
                    departureAirportCode: currentReqOrigin, // For consistency with schema
                    arrivalAirportCode: currentReqDestination, // For consistency with schema
                    departureTime: new Date(`${targetDate}T10:00:00Z`),
                    arrivalTime: new Date(`${targetDate}T13:00:00Z`),
                    ...baseFlight,
                    segments: [{ // Dummy segment for consistency
                        flightNumber: baseFlight.flightNumber,
                        airline: baseFlight.airline,
                        airlineCode: baseFlight.airlineCode,
                        departureAirport: currentReqOrigin,
                        departureAirportCode: currentReqOrigin,
                        departureTime: new Date(`${targetDate}T10:00:00Z`),
                        arrivalAirport: currentReqDestination,
                        arrivalAirportCode: currentReqDestination,
                        arrivalTime: new Date(`${targetDate}T13:00:00Z`),
                        durationMinutes: baseFlight.durationMinutes,
                        aircraftType: baseFlight.aircraftType,
                        departureTerminal: baseFlight.departureTerminal,
                        arrivalTerminal: baseFlight.arrivalTerminal,
                        numberOfStops: 0,
                    }],
                    totalDurationMinutes: baseFlight.durationMinutes,
                };
            }
        };

        const NUM_DUMMY_FLIGHTS = 3;
        for (let i = 0; i < NUM_DUMMY_FLIGHTS; i++) {
            if (tripType === 'round-trip' && returnDate) {
                const dummyOutbound = generateDummyFlightObject(false, origin, destination, date);
                const dummyReturn = generateDummyFlightObject(true, origin, destination, returnDate);
                finalFlightsToReturn.push({
                    _id: `dummy-rt-${i}-${origin}-${destination}-${date}`, // Unique ID for RT offer
                    externalApiId: `dummy-rt-${i}-${origin}-${destination}-${date}`,
                    outboundFlight: dummyOutbound,
                    returnFlight: dummyReturn,
                    // Total price for dummy round trip, per person
                    totalPrice: dummyOutbound.price + dummyReturn.price,
                    currency: 'NGN',
                    availableSeats: Math.min(dummyOutbound.availableSeats, dummyReturn.availableSeats),
                    class: 'ECONOMY',
                });
            } else {
                const dummyOneWay = generateDummyFlightObject(false, origin, destination, date);
                finalFlightsToReturn.push({
                    ...dummyOneWay,
                    totalPrice: dummyOneWay.price, // For one-way, totalPrice is just its price (per person)
                });
            }
        }
        console.log('[getRealFlights] Generated dummy data. Final flights to return:', finalFlightsToReturn.length);
    }

    res.json(finalFlightsToReturn);
};

// Controller for fetching single flight details by ID (no changes needed here for real flights unless you want to use Amadeus details lookup APIs)
const getFlightById = async (req, res) => {
    const { id } = req.params;
    console.log(`[getFlightById] Received ID: ${id}`);

    // Check if the ID is a dummy ID
    if (id.startsWith('dummy-')) {
        console.log(`[getFlightById] ID '${id}' is a dummy ID. Attempting to parse.`);
        try {
            const parts = id.split('-'); 
            // Expected format for dummy-outbound: dummy-outbound-{origin}-{destination}-{year}-{month}-{day}-{flightNumber} (8 parts)
            // Expected format for dummy-return: dummy-return-{destination}-{origin}-{year}-{month}-{day}-{flightNumber} (8 parts)
            // Expected format for dummy-rt: dummy-rt-{index}-{origin}-{destination}-{date} (6 parts) - needs special handling for nested
            
            // This logic is designed to reconstruct a full flight object from the dummy ID.
            // It needs to match the structure returned by getRealFlights for dummy data.
            // For `dummy-rt` IDs, we need to generate both outbound and return.

            if (parts[1] === 'rt') { // Handle dummy round-trip IDs
                if (parts.length !== 6) {
                    return res.status(400).json({ message: `Invalid dummy round-trip ID length: ${parts.length} parts found for ID: ${id}. Expected 6 parts.` });
                }
                const index = parts[2]; // not directly used in reconstruction
                const originCode = parts[3];
                const destinationCode = parts[4];
                const date = parts[5]; // This is the departure date

                const dummyOutbound = {
                    _id: `dummy-outbound-${originCode}-${destinationCode}-${date}-DM000`, // Reconstruct a consistent dummy ID for leg
                    flightNumber: `DM${Math.floor(Math.random() * 900) + 100}`,
                    airline: 'Dummy Air',
                    airlineCode: 'DUM',
                    externalApiId: `dummy-outbound-${originCode}-${destinationCode}-${date}-DM000`,
                    departureAirport: originCode,
                    arrivalAirport: destinationCode,
                    departureAirportCode: originCode, // For consistency with schema
                    arrivalAirportCode: destinationCode, // For consistency with schema
                    departureTime: new Date(`${date}T10:00:00Z`),
                    arrivalTime: new Date(`${date}T13:00:00Z`),
                    durationMinutes: 180,
                    capacity: 180,
                    availableSeats: Math.floor(Math.random() * 100) + 50,
                    price: parseFloat((Math.random() * (150000 - 50000) + 50000).toFixed(2)), // Per-person
                    aircraftType: 'Boeing 737 (Simulated)',
                    status: 'Scheduled',
                    departureGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    departureTerminal: 'T1',
                    arrivalGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    arrivalTerminal: 'T2',
                    currency: 'NGN',
                    class: 'ECONOMY',
                    segments: [{ // Dummy segment
                        flightNumber: `DM${Math.floor(Math.random() * 900) + 100}`,
                        airline: 'Dummy Air',
                        airlineCode: 'DUM',
                        departureAirport: originCode,
                        departureAirportCode: originCode,
                        departureTime: new Date(`${date}T10:00:00Z`),
                        arrivalAirport: destinationCode,
                        arrivalAirportCode: destinationCode,
                        arrivalTime: new Date(`${date}T13:00:00Z`),
                        durationMinutes: 180,
                        aircraftType: 'Boeing 737 (Simulated)',
                        departureTerminal: 'T1',
                        arrivalTerminal: 'T2',
                        numberOfStops: 0,
                    }],
                    totalDurationMinutes: 180,
                };
                
                // For dummy return, we need a return date. Let's assume it's one day after outbound
                const returnDateObj = new Date(date);
                returnDateObj.setDate(returnDateObj.getDate() + 1);
                const dummyReturnDate = returnDateObj.toISOString().split('T')[0];

                const dummyReturn = {
                    _id: `dummy-return-${destinationCode}-${originCode}-${dummyReturnDate}-DM000`,
                    flightNumber: `DM${Math.floor(Math.random() * 900) + 100}`,
                    airline: 'Dummy Air',
                    airlineCode: 'DUM',
                    externalApiId: `dummy-return-${destinationCode}-${originCode}-${dummyReturnDate}-DM000`,
                    departureAirport: destinationCode,
                    arrivalAirport: originCode,
                    departureAirportCode: destinationCode,
                    arrivalAirportCode: originCode,
                    departureTime: new Date(`${dummyReturnDate}T14:00:00Z`),
                    arrivalTime: new Date(`${dummyReturnDate}T17:00:00Z`),
                    durationMinutes: 180,
                    capacity: 180,
                    availableSeats: Math.floor(Math.random() * 100) + 50,
                    price: parseFloat((Math.random() * (150000 - 50000) + 50000).toFixed(2)), // Per-person
                    aircraftType: 'Boeing 737 (Simulated)',
                    status: 'Scheduled',
                    departureGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    departureTerminal: 'T1',
                    arrivalGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    arrivalTerminal: 'T2',
                    currency: 'NGN',
                    class: 'ECONOMY',
                    segments: [{ // Dummy segment
                        flightNumber: `DM${Math.floor(Math.random() * 900) + 100}`,
                        airline: 'Dummy Air',
                        airlineCode: 'DUM',
                        departureAirport: destinationCode,
                        departureAirportCode: destinationCode,
                        departureTime: new Date(`${dummyReturnDate}T14:00:00Z`),
                        arrivalAirport: originCode,
                        arrivalAirportCode: originCode,
                        arrivalTime: new Date(`${dummyReturnDate}T17:00:00Z`),
                        durationMinutes: 180,
                        aircraftType: 'Boeing 737 (Simulated)',
                        departureTerminal: 'T1',
                        arrivalTerminal: 'T2',
                        numberOfStops: 0,
                    }],
                    totalDurationMinutes: 180,
                };
                
                const combinedPrice = dummyOutbound.price + dummyReturn.price; // Per-person total
                return res.json({
                    _id: id,
                    externalApiId: id,
                    outboundFlight: dummyOutbound,
                    returnFlight: dummyReturn,
                    totalPrice: combinedPrice, // Per-person total for the round trip
                    currency: 'NGN',
                    availableSeats: Math.min(dummyOutbound.availableSeats, dummyReturn.availableSeats),
                    class: 'ECONOMY',
                });

            } else { // Handle dummy one-way IDs (outbound- or return-)
                if (parts.length !== 8) { // Updated check
                    console.error(`[getFlightById] Invalid dummy ID length: ${parts.length} parts found for ID: ${id}. Expected 8 parts.`);
                    return res.status(400).json({ message: `Invalid dummy flight ID format: Incorrect number of parts for ID: ${id}` });
                }

                const type = parts[1]; // e.g., "outbound" or "return"
                const originCode = parts[2];
                const destinationCode = parts[3];
                const year = parts[4];
                const month = parts[5];
                const day = parts[6];
                const flightNumber = parts[7];

                const date = `${year}-${month}-${day}`;
                console.log(`[getFlightById] Parsed details: type='${type}', origin='${originCode}', destination='${destinationCode}', date='${date}', flightNumber='${flightNumber}'`);

                const isReturnFlight = type === 'return';
                const departureAirport = isReturnFlight ? destinationCode : originCode;
                const arrivalAirport = isReturnFlight ? originCode : destinationCode;
                
                const departureTime = new Date(`${date}T${isReturnFlight ? '14:00:00Z' : '10:00:00Z'}`);
                const arrivalTime = new Date(`${date}T${isReturnFlight ? '17:00:00Z' : '13:00:00Z'}`);

                if (isNaN(departureTime.getTime()) || isNaN(arrivalTime.getTime())) {
                    console.error(`[getFlightById] Failed to create valid Date objects from '${date}'. Check date parsing.`);
                    return res.status(400).json({ message: `Could not parse date/time from dummy ID: ${id}. Date string: ${date}` });
                }

                const dummyFlight = {
                    _id: id,
                    flightNumber: flightNumber,
                    airline: 'Dummy Air',
                    airlineCode: 'DUM',
                    externalApiId: id,
                    departureAirport: departureAirport,
                    departureAirportCode: departureAirport, // For consistency with schema
                    arrivalAirport: arrivalAirport,
                    arrivalAirportCode: arrivalAirport, // For consistency with schema
                    departureTime: departureTime,
                    arrivalTime: arrivalTime,
                    estimatedDepartureTime: null,
                    actualDepartureTime: null,
                    estimatedArrivalTime: null,
                    actualArrivalTime: null,
                    durationMinutes: 180,
                    capacity: 180,
                    availableSeats: Math.floor(Math.random() * 100) + 50,
                    price: parseFloat((Math.random() * (150000 - 50000) + 50000).toFixed(2)), // Per-person price for dummy
                    aircraftType: 'Boeing 737 (Simulated)',
                    status: 'Scheduled',
                    departureGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    departureTerminal: 'T1',
                    arrivalGate: `G${Math.floor(Math.random() * 20) + 1}`,
                    arrivalTerminal: 'T2',
                    currency: 'NGN',
                    class: 'ECONOMY',
                    segments: [{ // Dummy segment for consistency
                        flightNumber: flightNumber,
                        airline: 'Dummy Air',
                        airlineCode: 'DUM',
                        departureAirport: departureAirport,
                        departureAirportCode: departureAirport,
                        departureTime: departureTime,
                        arrivalAirport: arrivalAirport,
                        arrivalAirportCode: arrivalAirport,
                        arrivalTime: arrivalTime,
                        durationMinutes: 180,
                        aircraftType: 'Boeing 737 (Simulated)',
                        departureTerminal: 'T1',
                        arrivalTerminal: 'T2',
                        numberOfStops: 0,
                    }],
                    totalDurationMinutes: 180,
                    totalPrice: parseFloat((Math.random() * (150000 - 50000) + 50000).toFixed(2)), // Matches 'price' for one-way
                };
                console.log(`[getFlightById] Successfully generated dummy flight object for ID: ${id}`);
                return res.json(dummyFlight);
            }
        } catch (parseError) {
            console.error(`[getFlightById] Caught an error during dummy ID processing for ID ${id}:`, parseError.message);
            return res.status(400).json({ message: `Error processing dummy flight details: ${parseError.message}` });
        }
    }

    // --- Handling Amadeus-generated IDs (e.g., 'amadeus-{offerId}') ---
    // If the ID is an Amadeus offer ID, we cannot directly retrieve its details
    // using a simple GET request via the Amadeus Flight Offers Search API (which is for broad searches).
    // Amadeus's workflow for getting full details of a specific offer
    // typically involves using the Flight Offers Price API, which requires the full offer JSON
    // to be POSTed, not just an ID.
    if (id.startsWith('amadeus-')) {
        console.warn(`[getFlightById] Direct detail lookup for Amadeus offer ID (${id}) is not supported via the current Amadeus API integration. This API is designed for search, not specific offer retrieval by ID.`);
        console.warn('To view details for a specific Amadeus flight offer, you would typically need to:');
        console.warn('1. Store the full Amadeus offer JSON in your database after a successful search.');
        console.warn('2. Implement an Amadeus Flight Offers Price API call, providing the full offer object from your stored data.');
        return res.status(404).json({
            message: `Flight details for offer ID '${id}' cannot be retrieved directly. Please re-perform a flight search, or if you have a saved booking, check your "My Bookings" section.`,
            suggestion: 'For full integration, consider saving Amadeus flight offer JSONs to your database when they are displayed, and retrieving them from your database for detail views.'
        });
    }

    // --- Original logic for fetching real flights from MongoDB (if saved) ---
    try {
        console.log(`[getFlightById] ID '${id}' is not a dummy or Amadeus API ID. Attempting to fetch from database assuming it's a MongoDB ObjectId.`);
        const flight = await Flight.findById(id); // This will look for a Flight record by its _id in your database
        if (!flight) {
            console.log(`[getFlightById] Real flight not found in database for ID: ${id}.`);
            return res.status(404).json({ message: 'Flight details not found in the database. Please search again or check your saved bookings.' });
        }
        console.log(`[getFlightById] Successfully fetched real flight from DB for ID: ${id}`);
        res.json(flight);
    } catch (error) {
        console.error('[getFlightById] Error fetching real flight by ID from DB:', error);
        if (error.name === 'CastError') {
            console.error(`[getFlightById] CastError: Invalid MongoDB ObjectId format for ID: ${id}`);
            return res.status(400).json({ message: 'Invalid flight ID format (not a valid MongoDB ObjectId).' });
        }
        res.status(500).json({ message: 'Server error fetching flight details.' });
    }
};

// Export the functions
module.exports = {
    getAmadeusAccessToken,
    getRealFlights,
    getFlightById
};