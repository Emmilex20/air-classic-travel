// frontend/src/components/AutocompleteInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react'; // For loading spinner

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Simple debounce function to limit API calls
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

/**
 * Reusable Autocomplete Input component for airport/city search.
 * Fetches suggestions from the backend's /api/locations/autocomplete-locations endpoint.
 *
 * @param {object} props - Component props
 * @param {string} props.label - Label for the input field (e.g., "From (Airport Code)")
 * @param {string} props.id - HTML ID for the input field
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.value - The currently selected IATA code (controlled by parent)
 * @param {function(string)} props.onChange - Callback when an IATA code is selected (receives IATA code)
 * @param {React.ElementType} props.icon - Lucide React icon component to display in the input
 */
const AutocompleteInput = ({ label, id, placeholder, value, onChange, icon: Icon }) => {
    // rawInput tracks what the user is currently typing and what is displayed in the input field.
    const [rawInput, setRawInput] = useState(''); // Initialize as empty string
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Store the detailed name of the *currently selected* item based on `value` prop
    // This helps in the blur logic to know if the displayed text corresponds to a selected item.
    const [selectedDetailedName, setSelectedDetailedName] = useState('');

    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Effect to synchronize rawInput and selectedDetailedName with the parent's `value` prop
    useEffect(() => {
        if (value) {
            // If parent's `value` (IATA code) is set, try to display its detailed name.
            // This is crucial for pre-filling or when the parent clears/sets the value.
            // We assume the component might not always have the detailedName for `value`.
            // A more robust solution might pass `initialDetailedName` from parent if `value` is pre-set.
            // For now, if a selection was made, `selectedDetailedName` should already hold it.
            // If `value` changes from parent (e.g., reset form), we need to handle it.
            if (value === selectedDetailedName) { // If value is already the detailed name
                setRawInput(value); // This implies value itself is the detailed name or IATA for display
            } else {
                 // Attempt to find it in current suggestions if available, or just use value as fallback.
                 // Ideally, if value is set externally, the parent also knows the detailedName.
                 const foundSuggestion = suggestions.find(s => s.iataCode === value);
                 if (foundSuggestion) {
                     setRawInput(foundSuggestion.detailedName);
                     setSelectedDetailedName(foundSuggestion.detailedName);
                 } else {
                     // Fallback: If no detailedName found, display the IATA code from the parent.
                     // In a real app, you might trigger a lookup for the detailedName here.
                     setRawInput(value);
                     setSelectedDetailedName(value); // Assume IATA code is the detailed name if nothing else
                 }
            }
        } else {
            // If parent's `value` is empty, clear everything related to the input.
            setRawInput('');
            setSelectedDetailedName('');
        }
    }, [value]); // Depend only on `value` from parent. `suggestions` dependency removed to prevent loops.


    // Debounced function to fetch suggestions
    const debouncedFetchSuggestions = useRef(
        debounce(async (keyword) => {
            if (keyword.length < 2) {
                setSuggestions([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Call your backend's new autocomplete endpoint
                const response = await axios.get(`${API_URL}/locations/autocomplete-locations`, {
                    params: { keyword }
                });

                // Deduplicate suggestions by iataCode to prevent React key warnings
                const uniqueSuggestions = [];
                const seenIataCodes = new Set();
                response.data.forEach(suggestion => {
                    if (!seenIataCodes.has(suggestion.iataCode)) {
                        uniqueSuggestions.push(suggestion);
                        seenIataCodes.add(suggestion.iataCode);
                    }
                });
                setSuggestions(uniqueSuggestions);

            } catch (error) {
                console.error("Error fetching autocomplete suggestions:", error);
                // You will see 429 errors here if backend rate limits or Amadeus limits are hit
                // Optionally show a toast error to the user:
                // if (error.response && error.response.status === 429) {
                //     toast.error("Too many requests. Please try again in a moment.");
                // } else {
                //     toast.error("Failed to load suggestions.");
                // }
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300) // 300ms debounce delay
    ).current;

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setRawInput(newValue); // Update the raw input display
        setShowSuggestions(true); // Always show suggestions when typing
        // Always clear the parent's actual value as user is typing, unless they select
        // This makes sure the parent state is nullified if typing over a selection
        onChange(''); 
        setSelectedDetailedName(''); // Clear stored selection when typing
        debouncedFetchSuggestions(newValue);
    };

    const handleSelectSuggestion = (suggestion) => {
        setRawInput(suggestion.detailedName); // Display full name in input
        onChange(suggestion.iataCode); // Pass IATA code to parent form state
        setSelectedDetailedName(suggestion.detailedName); // Store the full name of the selected item
        setSuggestions([]); // Clear suggestions
        setShowSuggestions(false); // Hide suggestions
    };

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current && !inputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Also close suggestions when input loses focus AND handle clearing logic
    const handleInputBlur = () => {
        // Delay hiding suggestions to allow click on suggestion list
        setTimeout(() => {
            setShowSuggestions(false);
            
            // Scenario 1: User cleared the input manually.
            if (rawInput === '') {
                onChange(''); // Clear the parent's value
                setSelectedDetailedName(''); // Clear stored display name
                return;
            }

            // Scenario 2: User typed something and blurred without selecting.
            // Check if the current rawInput matches a *previously selected* detailed name (from `value` prop)
            // or if `rawInput` doesn't correspond to the current `value` (IATA code) passed in.
            // If the `value` prop is set (meaning a valid IATA code is selected) AND
            // the `rawInput` in the field matches the `detailedName` we stored for that selection,
            // then do nothing (it's a valid selection, user just blurred).
            if (value && rawInput === selectedDetailedName) {
                // Valid selection, rawInput matches, do nothing.
                return;
            }

            // Scenario 3: User typed something, blurred, but it's not a valid selection
            // or doesn't match the current 'value'.
            // Clear the input and the parent's value.
            onChange(''); 
            setRawInput('');
            setSelectedDetailedName('');
            // toast.warn("Please select a valid airport from the suggestions."); // Optional toast warning
        }, 100); // Short delay to allow `onMouseDown` on suggestion to fire
    };

    const handleInputFocus = () => {
        if (rawInput.length >= 2) {
            setShowSuggestions(true);
            debouncedFetchSuggestions(rawInput); // Re-fetch if already typed
        } else if (rawInput === '' && value) {
            // If input is empty but parent `value` exists, pre-fill from `selectedDetailedName`
            // and fetch suggestions for it. This helps if user re-focuses.
            setRawInput(selectedDetailedName || value); // Fallback to IATA code if detailed name not set
            debouncedFetchSuggestions(selectedDetailedName || value);
            setShowSuggestions(true);
        }
    };


    return (
        <div className="relative">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {Icon && <Icon className="h-5 w-5 text-gray-400" />}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    name={id}
                    value={rawInput} // Use rawInput for displaying user's typing
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    autoComplete="off" // Disable browser autocomplete
                />
            </div>

            {showSuggestions && (rawInput.length >= 2) && (suggestions.length > 0 || loading) && (
                <ul
                    ref={suggestionsRef}
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                >
                    {loading ? (
                        <li className="p-2 text-center text-gray-500 flex items-center justify-center">
                            <Loader2 className="animate-spin mr-2" size={16} /> Loading...
                        </li>
                    ) : (
                        suggestions.map((suggestion) => (
                            <li
                                key={suggestion.iataCode} // Key is unique due to deduplication in debouncedFetchSuggestions
                                // onMouseDown is used instead of onClick to prevent the input's onBlur
                                // from firing before the click, which would hide the suggestions.
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevents input from losing focus immediately
                                    handleSelectSuggestion(suggestion);
                                }}
                                className="p-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition duration-150 ease-in-out text-gray-800 text-sm"
                            >
                                {suggestion.detailedName}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
