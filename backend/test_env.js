// backend/test_env.js
require('dotenv').config();

console.log('--- Testing Environment Variables ---');
console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY);
console.log('RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST);
console.log('RAPIDAPI_AERODATABOX_BASE_URL:', process.env.RAPIDAPI_AERODATABOX_BASE_URL);
console.log('PORT:', process.env.PORT); // Also test a known variable like PORT
console.log('--- End Test ---');