import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Import icons from lucide-react
import {
    Users,              // Main icon for User Management
    Edit,               // Edit user
    Trash2,             // Delete user
    PlusCircle,         // Add user (future functionality, if needed)
    ArrowLeft,          // Back to dashboard
    CircleAlert,        // Error icon
    Loader2,            // Loading spinner
    CheckCircle,        // Success icon
    Shield,             // For admin role
    User                // For general user role
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Define the allowed roles for the dropdown
const ALLOWED_ROLES = ['user', 'admin']; // Added other common roles from your backend for flexibility

function UserManagement() {
    const { user, token, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(null); // Stores ID of user being edited
    const [editData, setEditData] = useState({}); // Stores data for the user being edited

    // Permission check and initial data fetch
    useEffect(() => {
        if (!authLoading) { // Wait for auth context to load
            if (!user || !user.roles.includes('admin')) {
                toast.error('Access Denied: You must be an administrator to view this page.');
                navigate('/dashboard'); // Redirect to dashboard or home
                return;
            }
            fetchUsers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token, authLoading, navigate]);

    const fetchUsers = async () => {
        if (!token) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(`${API_URL}/users`, config); // Assuming an /api/users endpoint
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            const errorMsg = err.response?.data?.message || 'Failed to load users. You might not have permission.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (userToEdit) => {
        setIsEditing(userToEdit._id);
        // For editing, ensure roles is an array for internal state, but for the input
        // if you want a multi-select or just a single primary role, you'd handle differently.
        // For a single dropdown, we'll assume the first role or a specific 'primary' role.
        // Or if multiple roles are possible but the dropdown is for ONE primary role,
        // you'd need to decide which one to show.
        // For simplicity, let's assume the dropdown will manage the *primary* role
        // or just let the user pick one, and other roles might be added/removed differently.
        // Given your backend expects an array, we'll allow multi-select in the dropdown.
        // The dropdown will now allow selecting multiple roles, so we don't need to join/split.
        // We'll pass the current roles array directly to editData.
        setEditData({ ...userToEdit, roles: userToEdit.roles });
    };

    const handleEditChange = (e) => {
        const { name, value, type, options } = e.target;

        if (type === 'select-multiple') {
            const selectedRoles = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setEditData({ ...editData, [name]: selectedRoles });
        } else {
            setEditData({ ...editData, [name]: value });
        }
    };

    const handleSaveEdit = async (userId) => {
        if (!token) {
            toast.error('Authentication token missing. Please log in.');
            return;
        }
        if (!user || !user.roles.includes('admin')) {
            toast.error('You do not have permission to edit users.');
            return;
        }

        // The payload already has roles as an array if handleEditChange for select-multiple is used
        const payload = {
            ...editData,
            // Ensure roles is always an array, even if empty or single
            roles: Array.isArray(editData.roles) ? editData.roles : [editData.roles].filter(Boolean),
        };

        // Important: Remove _id from payload before sending to backend if backend doesn't expect it
        // eslint-disable-next-line no-unused-vars
        const { _id, __v, createdAt, updatedAt, ...dataToSend } = payload;


        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            await axios.put(`${API_URL}/users/${userId}`, dataToSend, config); // Assuming PUT /api/users/:id
            toast.success('User updated successfully!');
            setIsEditing(null); // Exit edit mode
            setEditData({}); // Clear edit data
            fetchUsers(); // Re-fetch users to show updated data
        } catch (err) {
            console.error('Error updating user:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update user.';
            toast.error(errorMsg);
        }
    };

    const handleDeleteUser = async (userId) => {
        toast.info(
            ({ closeToast }) => (
                <div className="text-center">
                    <p className="font-semibold text-lg mb-2 text-gray-800">Are you sure you want to delete this user?</p>
                    <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <button
                            onClick={async () => {
                                if (!token) {
                                    toast.error('Authentication token missing.');
                                    closeToast();
                                    return;
                                }
                                if (!user || !user.roles.includes('admin')) {
                                    toast.error('You do not have permission to delete users.');
                                    closeToast();
                                    return;
                                }
                                try {
                                    const config = { headers: { Authorization: `Bearer ${token}` } };
                                    await axios.delete(`${API_URL}/users/${userId}`, config); // Assuming DELETE /api/users/:id
                                    toast.success('User deleted successfully!');
                                    fetchUsers(); // Re-fetch users
                                } catch (err) {
                                    console.error('Error deleting user:', err);
                                    const errorMsg = err.response?.data?.message || 'Failed to delete user.';
                                    toast.error(errorMsg);
                                } finally {
                                    closeToast();
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={closeToast}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { closeButton: false, autoClose: false, closeOnClick: false }
        );
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Loader2 className="animate-spin text-indigo-500 mr-3" size={32} />
                <p className="text-xl text-gray-600">Loading user data...</p>
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

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-140px)]">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in-down flex items-center justify-center">
                <Users size={40} className="mr-3 text-indigo-600" /> User Management
            </h1>

            <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 border border-indigo-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Users size={24} className="mr-2 text-indigo-500" /> All System Users
                </h2>

                {users.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-lg text-gray-600">No users found.</p>
                        <p className="text-md text-gray-500">The system is currently empty or users are not loaded.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">User ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th> {/* Changed from Name to Username as per backend */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((userItem) => (
                                    <tr key={userItem._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {userItem._id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {isEditing === userItem._id ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={editData.email || ''}
                                                    onChange={handleEditChange}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            ) : (
                                                userItem.email
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {isEditing === userItem._id ? (
                                                <input
                                                    type="text"
                                                    name="username" // Changed name to username as per backend
                                                    value={editData.username || ''}
                                                    onChange={handleEditChange}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            ) : (
                                                userItem.username || 'N/A'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {isEditing === userItem._id ? (
                                                <select
                                                    name="roles"
                                                    multiple={true} // Allow multiple selections
                                                    value={editData.roles || []} // Ensure it's an array for multiple select
                                                    onChange={handleEditChange}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-24" // Increased height for multiple options
                                                >
                                                    {ALLOWED_ROLES.map(role => (
                                                        <option key={role} value={role}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)} {/* Capitalize for display */}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {userItem.roles.map((role, idx) => (
                                                        <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                            role === 'airline_staff' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isEditing === userItem._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(userItem._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                                    >
                                                        <CheckCircle size={14} className="mr-1" /> Save
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(null)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(userItem)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                                    >
                                                        <Edit size={14} className="mr-1" /> Edit
                                                    </button>
                                                    {userItem._id !== user._id && ( // Prevent admin from deleting themselves
                                                        <button
                                                            onClick={() => handleDeleteUser(userItem._id)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} className="mr-1" /> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Back to Dashboard Button */}
            <div className="text-center mt-10">
                <Link to="/dashboard" className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default UserManagement;