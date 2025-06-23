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
import About from './pages/About';

// NEW IMPORT for All Bookings and All Payments
import AllBookings from './pages/AllBookings';
import AllPayments from './pages/AllPayments'; // Make sure this path is correct

// Import dedicated Protected Route components for role-based access
import ProtectedRoute from './components/ProtectedRoute'; // For roles array
import ProtectedAdminRoute from './components/ProtectedAdminRoute'; // Specifically for 'admin' (can be simplified if ProtectedRoute is flexible enough)


function App() {
    return (
        <Router>
            <ScrollToTop />
            <AuthProvider> {/* AuthProvider wraps the entire application to provide auth context */}
                <Navbar />
                <main className="flex-grow"> {/* Use flex-grow to push footer to bottom */}
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/flights" element={<FlightList />} />
                        <Route path="/flights/:id" element={<FlightDetails />} />
                        <Route path="/about" element={<About />} />

                        {/* Hotel Public Routes */}
                        <Route path="/hotels" element={<HotelList />} />
                        <Route path="/hotels/:id" element={<HotelDetails />} />

                        {/* Forgot Password & Reset Password Routes */}
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />

                        {/* Protected Routes for Admin Dashboard (using specific admin route component) */}
                        {/* Note: This ProtectedAdminRoute might internally use ProtectedRoute or have its own logic */}
                        <Route element={<ProtectedAdminRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>

                        {/* Grouping Protected Routes by required role(s) */}

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

                        {/* User Management, All Bookings, All Payments: Only for Admin */}
                        {/* These are grouped under a single ProtectedRoute with admin role */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/bookings" element={<AllBookings />} />
                            <Route path="/admin/payments" element={<AllPayments />} /> {/* NEW ROUTE ADDED HERE */}
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