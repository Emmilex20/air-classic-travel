// frontend/src/pages/Contact.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ArrowRight,
    Speech,
    User,
    AtSign,
    Pencil,
    Sparkles,
    Headphones,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Ticket,
    CreditCard,
    Plane,
    Hotel,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Reusable Contact Info Card Component
const ContactInfoCard = ({ icon, title, content, description }) => (
    <div className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="p-3 mr-4 bg-gray-50 rounded-full shadow-inner flex-shrink-0">
            {icon}
        </div>
        {/* ADDED min-w-0 here to ensure text can wrap, especially long emails */}
        <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
            {/* The email content itself still has break-all for aggressive breaking */}
            <div className="text-lg text-gray-700 font-medium">{content}</div>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
    </div>
);

// Reusable Social Link Component
const SocialLink = ({ icon, href, color }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block p-3 rounded-full bg-white shadow-md transform hover:-translate-y-1 transition-all duration-300 ${color}`}
    >
        {icon}
    </a>
);

// Reusable FAQ Item Component
const FAQItem = ({ question, answer, icon, isOpen, toggle }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
        <button
            onClick={toggle}
            className="flex justify-between items-center w-full px-6 py-4 text-left font-semibold text-lg text-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
        >
            <span className="flex items-center">
                {icon}
                {question}
            </span>
            {isOpen ? <ChevronUp size={20} className="text-indigo-600" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>
        <div
            className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ overflow: 'hidden' }}
        >
            <p className="px-6 py-4 text-gray-700 bg-white border-t border-gray-100">{answer}</p>
        </div>
    </div>
);


function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFAQIndex, setOpenFAQIndex] = useState(null);

    const faqs = [
        {
            question: "How do I book a flight?",
            answer: "Booking a flight on VoyageEase is easy! Simply navigate to the 'Flights' section, enter your departure and destination, dates, and number of passengers. Then, browse the available flights and proceed to secure your booking with our seamless payment process.",
            icon: <Plane size={20} className="text-blue-500 mr-2" />
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept various secure payment methods, including major credit/debit cards (Visa, Mastercard), and local payment options via Paystack.",
            icon: <CreditCard size={20} className="text-green-500 mr-2" />
        },
        {
            question: "Can I cancel or modify my booking?",
            answer: "Cancellation and modification policies vary depending on the airline or hotel and the type of fare/room booked. Please check the specific terms and conditions of your booking. For assistance, you can contact our support team.",
            icon: <Ticket size={20} className="text-orange-500 mr-2" />
        },
        {
            question: "How do I receive my booking confirmation?",
            answer: "Upon successful payment and booking, a confirmation email with all your travel details and e-tickets/vouchers will be sent to the email address provided during booking. Please check your spam folder if you don't receive it within minutes.",
            icon: <Mail size={20} className="text-red-500 mr-2" />
        },
        {
            question: "Do you offer group bookings?",
            answer: "Yes, for group bookings (typically 10 or more passengers for flights, or multiple rooms for hotels), please contact our dedicated group sales team via email or phone for personalized assistance and potential discounts.",
            icon: <User size={20} className="text-purple-500 mr-2" />
        },
        {
            question: "What if I encounter an issue during my trip?",
            answer: "Our customer support team is available during business hours to assist you with any issues during your trip. Please refer to your booking confirmation for emergency contact numbers or use the contact form on this page.",
            icon: <Headphones size={20} className="text-teal-500 mr-2" />
        },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { name, email, subject, message } = formData;
        if (!name || !email || !subject || !message) {
            toast.error('Please fill in all fields.');
            setIsSubmitting(false);
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        console.log('Form Data Submitted:', formData);

        // --- Mock success for demonstration since backend is not implemented here ---
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    const toggleFAQ = (index) => {
        setOpenFAQIndex((prevIndex) => (prevIndex === index ? null : index));
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800">

            {/* Hero Section */}
            <section className="relative h-[45vh] md:h-[55vh] flex items-center justify-center text-white overflow-hidden p-4 md:p-8">
                {/* Background Image/Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://www.aircanada.com/content/dam/aircanada/portal/images/content-images/fly/customer-support/lg-cs-directory.jpg')` }}
                >
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        Get In Touch
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl font-light mb-8 opacity-90 tracking-wide">
                        We're here to help! Reach out to us for any inquiries.
                    </p>
                </div>
            </section>

            {/* Main Contact Content */}
            <section className="relative z-20 bg-white rounded-t-3xl -mt-8 py-16 md:py-24 shadow-2xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        {/* Contact Form */}
                        <div className="bg-gradient-to-br from-white to-blue-50 p-8 md:p-10 rounded-2xl shadow-xl border border-blue-100 animate-slide-in-left">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center lg:justify-start">
                                <MessageSquare size={32} className="text-indigo-600 mr-3" /> Send Us A Message
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        <User size={16} className="inline-block mr-1 text-gray-500" /> Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition-all duration-200 focus:shadow-md"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        <AtSign size={16} className="inline-block mr-1 text-gray-500" /> Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition-all duration-200 focus:shadow-md"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Pencil size={16} className="inline-block mr-1 text-gray-500" /> Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition-all duration-200 focus:shadow-md"
                                        placeholder="Regarding my booking..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Speech size={16} className="inline-block mr-1 text-gray-500" /> Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition-all duration-200 focus:shadow-md resize-y"
                                        placeholder="Type your message here..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white transition-all duration-300 transform ${
                                        isSubmitting
                                            ? 'bg-indigo-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} className="mr-2" /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gradient-to-br from-white to-blue-50 p-8 md:p-10 rounded-2xl shadow-xl border border-indigo-100 animate-slide-in-right">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center lg:justify-start">
                                <Headphones size={32} className="text-blue-600 mr-3" /> Our Details
                            </h2>
                            <div className="space-y-8">
                                <ContactInfoCard
                                    icon={<Phone size={28} className="text-green-600" />}
                                    title="Call Us"
                                    content={<a href="tel:+2348012345678" className="hover:underline text-blue-600 font-semibold">+234 801 234 5678</a>}
                                    description="Available during business hours for immediate assistance."
                                />
                                <ContactInfoCard
                                    icon={<Mail size={28} className="text-red-600" />}
                                    title="Email Us"
                                    content={<a href="mailto:support@voyageease.com" className="hover:underline text-blue-600 font-semibold break-all">support@airclassictravel.com</a>}
                                    description="For general inquiries, partnership, or detailed support."
                                />
                                <ContactInfoCard
                                    icon={<MapPin size={28} className="text-purple-600" />}
                                    title="Our Location"
                                    content={<p>123 Travel Avenue, Cityville, State, Country</p>}
                                    description="Visit our office by appointment."
                                />
                                <ContactInfoCard
                                    icon={<Clock size={28} className="text-yellow-600" />}
                                    title="Business Hours"
                                    content={<p>Mon - Fri: 9:00 AM - 5:00 PM (GMT+1)</p>}
                                    description="Weekends: Closed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="text-center mt-20 mb-12 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                            <Sparkles size={32} className="text-pink-500 mr-3" /> Connect With Us
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Follow us on social media for the latest updates, deals, and travel inspiration!
                        </p>
                        <div className="flex justify-center space-x-6">
                            <SocialLink icon={<Facebook size={36} />} href="https://facebook.com/voyageease" color="text-blue-700 hover:text-blue-800" />
                            <SocialLink icon={<Twitter size={36} />} href="https://twitter.com/voyageease" color="text-sky-500 hover:text-sky-600" />
                            <SocialLink icon={<Instagram size={36} />} href="https://instagram.com/voyageease" color="text-pink-600 hover:text-pink-700" />
                            <SocialLink icon={<Linkedin size={36} />} href="https://linkedin.com/company/voyageease" color="text-blue-800 hover:text-blue-900" />
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-xl border border-indigo-200 p-8 my-16 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
                            <HelpCircle size={32} className="text-indigo-600 mr-3" /> Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-600 text-center mb-10 max-w-2xl mx-auto">
                            Find quick answers to common questions about booking, payments, and our services.
                        </p>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    question={faq.question}
                                    answer={faq.answer}
                                    icon={faq.icon}
                                    isOpen={openFAQIndex === index}
                                    toggle={() => toggleFAQ(index)}
                                />
                            ))}
                        </div>
                        <p className="text-center text-gray-600 mt-10 text-md">
                            Still have questions? Reach out to us using the form above!
                        </p>
                    </div>

                    {/* Back to Home Button */}
                    <div className="text-center mt-12">
                        <Link
                            to="/"
                            className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            <ArrowRight size={20} className="mr-2 rotate-180" /> Back to Home
                        </Link>
                    </div>

                </div>
            </section>
        </div>
    );
}

export default Contact;