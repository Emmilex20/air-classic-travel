// backend/controllers/locationController.js
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const NodeCache = require('node-cache'); // Import node-cache

// Import getAmadeusAccessToken from realFlightController
const { getAmadeusAccessToken } = require('./realFlightController'); 

// Amadeus API base URL for autocomplete locations
const AMADEUS_AUTOCOMPLETE_URL = 'https://test.api.amadeus.com/v1/reference-data/locations'; 

// Initialize cache with a standard TTL (Time To Live) for 1 hour (3600 seconds)
// Adjust stdTTL and checkperiod as needed for your use case and data freshness requirements
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); 

exports.autocompleteLocations = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
        return res.status(400).json({ message: 'Keyword with at least 2 characters is required for autocomplete.' });
    }

    const cacheKey = `autocomplete_locations_${keyword.toLowerCase()}`;
    const cachedResult = myCache.get(cacheKey);

    if (cachedResult) {
        console.log(`[Autocomplete Cache] Serving "${keyword}" from cache.`);
        return res.json(cachedResult);
    }

    let token;
    try {
        // Now getAmadeusAccessToken is available because it's imported
        token = await getAmadeusAccessToken(); 
    } catch (authError) {
        console.error('[Autocomplete] Failed to get Amadeus access token:', authError.message);
        return res.status(500).json({ message: 'Could not authenticate with external API for autocomplete.' });
    }

    const amadeusHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const amadeusParams = {
        subType: 'CITY,AIRPORT', // Or just 'AIRPORT' if you only want airports
        keyword: keyword,
        'page[limit]': 10 // CORRECTED: Use 'page[limit]' instead of 'max'
    };

    try {
        const amadeusResponse = await axios.get(AMADEUS_AUTOCOMPLETE_URL, {
            headers: amadeusHeaders,
            params: amadeusParams,
        });

        const rawLocations = amadeusResponse.data.data;
        const dictionaries = amadeusResponse.data.dictionaries;

        const processedLocations = rawLocations
            .filter(loc => loc.iataCode) // Ensure it has an IATA code
            .map(loc => ({
                iataCode: loc.iataCode,
                name: loc.name,
                // Using template literals correctly, fixed potential MathJax formatting from previous turn
                detailedName: `${loc.name} (${loc.iataCode}) - ${dictionaries?.locations?.[loc.iataCode]?.cityName || loc.address?.cityName || loc.address?.countryName || ''}`.trim().replace(/ -$/, ''),
                city: loc.address?.cityName,
                country: loc.address?.countryName,
                type: loc.subType, // AIRPORT or CITY
            }));

        // --- Cache the result before sending ---
        myCache.set(cacheKey, processedLocations); 
        console.log(`[Autocomplete Cache] Cached "${keyword}" results.`);
        
        res.json(processedLocations);

    } catch (error) {
        console.error('[Autocomplete] Error fetching locations from Amadeus:', error.message);
        if (error.response) {
            console.error('[Autocomplete] Amadeus API response error data:', JSON.stringify(error.response.data, null, 2));
            console.error('[Autocomplete] Amadeus API response status:', error.response.status);
            // Handle 429 specifically from Amadeus if needed
            if (error.response.status === 429) {
                return res.status(429).json({ message: 'External API rate limit reached. Please try again in a moment.' });
            }
            res.status(error.response.status).json({ message: error.response.data.message || 'Error fetching autocomplete data from external API.' });
        } else if (error.request) {
            res.status(503).json({ message: 'No response from external autocomplete API.' });
        } else {
            res.status(500).json({ message: 'Server error processing autocomplete request.' });
        }
    }
});
