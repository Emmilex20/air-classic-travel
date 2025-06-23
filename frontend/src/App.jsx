// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthContext, AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FlightList from './pages/FlightList';
import FlightForm from './pages/FlightForm';
import MyBookings from './pages/MyBookings';
import FlightDetails from './pages/FlightDetails';
import HotelList from './pages/HotelList';
import HotelForm from './pages/HotelForm';
import HotelDetails from './pages/HotelDetails';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserManagement from './pages/UserManagement';

// NEW IMPORT for All Bookings
import AllBookings from './pages/AllBookings';

// Import dedicated Protected Route components for role-based access
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';


function App() {
    return (
        <Router>
            <ScrollToTop /> 
            <AuthProvider> {/* AuthProvider wraps the entire application */}
                <Navbar />
                <main className="flex-grow"> {/* Use flex-grow to push footer to bottom */}
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/flights" element={<FlightList />} />
                        <Route path="/flights/:id" element={<FlightDetails />} />

                        {/* Hotel Public Routes */}
                        <Route path="/hotels" element={<HotelList />} />
                        <Route path="/hotels/:id" element={<HotelDetails />} />

                        {/* Forgot Password & Reset Password Routes */}
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />

                        {/* Protected Routes */}
                        {/* Admin Dashboard: Only for admin role */}
                        <Route element={<ProtectedAdminRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>

                        {/* Flight Management: For Admin and Airline Staff */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'airline_staff']} />}>
                            <Route path="/flights/new" element={<FlightForm />} />
                            <Route path="/flights/edit/:flightId" element={<FlightForm />} />
                        </Route>

                        {/* Hotel Management: For Admin and Hotel Staff */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'hotel_staff']} />}>
                            <Route path="/hotels/new" element={<HotelForm />} />
                            <Route path="/hotels/edit/:hotelId" element={<HotelForm />} />
                        </Route>

                        {/* User Management: Only for Admin */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin/users" element={<UserManagement />} />
                        </Route>

                        {/* NEW PROTECTED ROUTE for All Bookings */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin/bookings" element={<AllBookings />} />
                        </Route>

                        {/* User Bookings: Any logged-in user can view their bookings */}
                        <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'airline_staff', 'hotel_staff']} />}>
                            <Route path="/my-bookings" element={<MyBookings />} />
                        </Route>

                        {/* Fallback for unmatched routes (404 Page) */}
                        <Route path="*" element={
                            <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-gray-100">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
                                <p className="text-lg text-gray-600">The page you're looking for doesn't exist.</p>
                                <Link to="/" className="mt-4 text-indigo-600 hover:underline">Go to Home</Link>
                            </div>
                        } />
                    </Routes>
                </main>
                <Footer />

                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                />
            </AuthProvider>
        </Router>
    );
}

export default App;