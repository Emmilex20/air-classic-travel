// frontend/src/pages/AllPayments.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { CreditCard, Loader2, CircleAlert, ArrowLeft } from 'lucide-react'; // Import icons
import { Link } from 'react-router-dom';


// Ensure this matches your Vite environment variable
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

function AllPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true); // Local loading state for data fetch
    const [error, setError] = useState(null);
    // Destructure user, token, and the new loading from AuthContext
    const { user, token, loading: authContextLoading } = useContext(AuthContext);

    useEffect(() => {
        const fetchPayments = async () => {
            console.log('AllPayments: fetchPayments triggered. authContextLoading:', authContextLoading, 'user:', user, 'token:', token); // Debug log

            // Wait for AuthContext to finish its initial loading from localStorage
            if (authContextLoading) {
                console.log('AllPayments: AuthContext still loading, waiting...');
                return;
            }

            // After authContextLoading is false, check user and token
            if (!user || !user.roles || !user.roles.includes('admin')) {
                toast.error('Access Denied: You must be an administrator to view payment data.');
                setLoading(false); // Set local loading to false, as we won't fetch
                return;
            }
            if (!token) { // Check the directly provided token from context
                toast.error('Authentication token not found. Please log in.');
                setLoading(false); // Set local loading to false
                return;
            }

            // If we reach here, user is an admin and token is available
            try {
                setLoading(true); // Start local loading for fetching payments
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                console.log('AllPayments: Attempting Axios GET to:', `${API_URL}/payments/admin`); // Debug log
                const response = await axios.get(`${API_URL}/payments/admin`, config);
                setPayments(response.data);
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error('AllPayments: Error fetching payments:', err);
                const errorMsg = err.response?.data?.message || 'Failed to load payments. Please try again.';
                setError(errorMsg);
                toast.error('Error fetching payments: ' + errorMsg);
            } finally {
                setLoading(false); // Always set local loading to false after fetch attempt
            }
        };

        // Call fetchPayments only when user or authContextLoading changes
        // This ensures it runs after authContextLoading is false and user/token are ready
        fetchPayments();
    }, [user, token, authContextLoading]); // <-- IMPORTANT: Add token and authContextLoading to dependencies

    // Group payments by date and calculate daily totals
    const getDailyTotals = () => {
        const dailyTotals = {};
        payments.forEach(payment => {
            const date = new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!dailyTotals[date]) {
                dailyTotals[date] = 0;
            }
            // Ensure payment.amount is a number before adding
            dailyTotals[date] += parseFloat(payment.amount || 0);
        });

        // Sort dates for display
        const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));

        return sortedDates.map(date => ({
            date,
            total: dailyTotals[date]
        }));
    };

    if (loading || authContextLoading) { // Check both local and context loading
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Loader2 className="animate-spin text-indigo-500 mr-3" size={32} />
                <p className="text-xl text-gray-600">Loading payments...</p>
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

    // If user is not admin AFTER loading, this component shouldn't even be rendered due to ProtectedRoute.
    // But as a final fallback, you could show a message or redirect again.
    if (!user || !user.roles || !user.roles.includes('admin')) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-100 p-4">
                <p className="text-lg text-red-500">Access Denied.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <CreditCard size={40} className="mr-3 text-violet-600" /> All Payments Overview
            </h1>

            {payments.length === 0 ? (
                <div className="text-center py-10 text-gray-600 bg-white rounded-xl shadow-lg border border-gray-100">
                    <CreditCard size={64} className="mb-4 text-violet-400 mx-auto" />
                    <p className="text-xl font-semibold mb-2">No payment records found.</p>
                    <p className="text-md text-gray-500">The system currently has no processed payments.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-2xl p-8 border border-violet-200 mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Payment Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Reference</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payee Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {payment.paystackReference ? payment.paystackReference.substring(0, 10) + '...' : payment._id.substring(0, 10) + '...'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(payment.amount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.currency || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.user?.email || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {payment.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    payment.type === 'flight' ? 'bg-blue-100 text-blue-800' :
                                                    payment.type === 'hotel' ? 'bg-teal-100 text-teal-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {payment.type || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-2xl p-8 border border-indigo-200">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Daily Payment Totals</h2>
                        {getDailyTotals().length === 0 ? (
                            <p className="text-lg text-gray-600 text-center py-5">No daily totals available.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {getDailyTotals().map((daily, index) => (
                                    <div key={index} className="bg-indigo-50 p-6 rounded-lg shadow-md border border-indigo-200 flex flex-col justify-between items-center text-center">
                                        <h3 className="text-xl font-semibold text-indigo-800 mb-2">{daily.date}</h3>
                                        <p className="text-3xl font-bold text-indigo-900 mt-auto">{formatCurrency(daily.total)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Back to Dashboard Button */}
                    <div className="text-center mt-10">
                        <Link to="/dashboard" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                            <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default AllPayments;