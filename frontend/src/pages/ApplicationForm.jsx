import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, User, Mail, Phone, Paperclip } from 'lucide-react';

function ApplicationForm() {
    const { jobId } = useParams(); // Get the job ID from the URL if passed
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        cvFile: null,
    });
    const [submissionStatus, setSubmissionStatus] = useState(null); // 'idle', 'submitting', 'success', 'error'
    const [selectedFileName, setSelectedFileName] = useState('');

    // Dummy job titles for display (in a real app, you'd fetch this)
    const jobTitles = {
        1: "Experienced Flight Attendant",
        2: "Senior Aviation Mechanic (Airframe & Powerplant)",
        3: "Customer Service & Reservations Agent",
        4: "Airport Operations Coordinator",
        5: "Airline Pilot (First Officer)"
    };

    const currentJobTitle = jobId ? jobTitles[jobId] : "General Application";


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, cvFile: file }));
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('submitting');

        // In a real application, you would send formData to a backend API
        // Example:
        /*
        const dataToSend = new FormData();
        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }
        dataToSend.append('jobId', jobId); // Include job ID

        try {
            const response = await fetch('/api/apply', {
                method: 'POST',
                body: dataToSend,
            });

            if (response.ok) {
                setSubmissionStatus('success');
                // Optionally clear form: setFormData({ fullName: '', email: '', phone: '', coverLetter: '', cvFile: null });
            } else {
                setSubmissionStatus('error');
                console.error('Submission failed:', await response.text());
            }
        } catch (error) {
            setSubmissionStatus('error');
            console.error('Network error or submission issue:', error);
        }
        */

        // Simulate API call success/failure
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% chance of success for demo
            if (success) {
                setSubmissionStatus('success');
                setFormData({ fullName: '', email: '', phone: '', coverLetter: '', cvFile: null });
                setSelectedFileName('');
            } else {
                setSubmissionStatus('error');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-inter text-gray-800 py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <Link
                    to="/careers"
                    className="inline-flex items-center text-purple-700 hover:text-purple-900 font-semibold transition-colors mb-8 text-lg"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Job Openings
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    <div className="relative p-8 md:p-12 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center">
                        <Send size={60} className="mx-auto mb-4 opacity-80" />
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg mb-3">
                            Apply for {currentJobTitle}
                        </h1>
                        <p className="text-xl md:text-2xl font-light opacity-90">
                            We're excited to learn more about you!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
                        {submissionStatus === 'success' && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline ml-2">Your application has been submitted. We'll be in touch soon!</span>
                            </div>
                        )}
                        {submissionStatus === 'error' && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline ml-2">There was an issue submitting your application. Please try again.</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="inline-block mr-1 text-purple-500" /> Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail size={16} className="inline-block mr-1 text-purple-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                                placeholder="john.doe@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone size={16} className="inline-block mr-1 text-purple-500" /> Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800"
                                placeholder="+123 456 7890"
                            />
                        </div>

                        <div>
                            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                                Cover Letter (Optional)
                            </label>
                            <textarea
                                name="coverLetter"
                                id="coverLetter"
                                value={formData.coverLetter}
                                onChange={handleChange}
                                rows="5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 resize-y"
                                placeholder="Tell us why you're a great fit for this role..."
                            ></textarea>
                        </div>

                        <div>
                            <label htmlFor="cvFile" className="block text-sm font-medium text-gray-700 mb-2">
                                <Paperclip size={16} className="inline-block mr-1 text-purple-500" /> Upload CV/Resume <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L40 32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="cvFile" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                                            <span>Upload a file</span>
                                            <input
                                                id="cvFile"
                                                name="cvFile"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx" // Specify accepted file types
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {selectedFileName ? selectedFileName : "PDF, DOC, DOCX up to 5MB"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submissionStatus === 'submitting'}
                        >
                            {submissionStatus === 'submitting' ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Application <Send size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ApplicationForm;