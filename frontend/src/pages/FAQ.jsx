import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    Bookmark, // For Bookings
    CreditCard, // For Payments
    Plane, // For Flights
    BriefcaseBusiness, // For Luggage
    UserCheck, // For Check-in
    ClipboardList, // For General Policies
    Headphones, // For Customer Support
    Smile, // For Loyalty Program
    ArrowRight, // For "Back to Home" or "Contact Us" link
    Tag 
} from 'lucide-react';

// Reusable FAQ Item Component
const FAQItem = ({ question, answer, isOpen, toggle }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg">
        <button
            onClick={toggle}
            className="flex justify-between items-center w-full px-6 py-4 text-left font-semibold text-lg text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
            <span className="flex-grow">{question}</span>
            {isOpen ? <ChevronUp size={24} className="text-indigo-600 ml-3 flex-shrink-0" /> : <ChevronDown size={24} className="text-gray-500 ml-3 flex-shrink-0" />}
        </button>
        <div
            className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 pt-0' : 'max-h-0 opacity-0'}`}
            style={{ overflow: 'hidden' }}
        >
            <div className="px-6 pb-4 pt-2 text-gray-700 bg-white border-t border-gray-100 leading-relaxed text-base">
                {/* Render HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: answer }} />
            </div>
        </div>
    </div>
);

function FAQ() {
    // Extensive Dummy FAQ data
    const faqs = useMemo(() => [
        {
            id: 1,
            question: "How do I book a flight?",
            answer: `
                <p>Booking a flight with VoyageEase is simple and straightforward!</p>
                <ol class="list-decimal list-inside space-y-1 mt-2">
                    <li>Navigate to the 'Flights' section on our homepage.</li>
                    <li>Enter your departure and destination airports (or cities).</li>
                    <li>Select your travel dates and the number of passengers.</li>
                    <li>Click 'Search Flights' to view available options.</li>
                    <li>Browse through the results, filter by price, airline, or time, and select your preferred flight.</li>
                    <li>Proceed to the secure payment page to complete your booking.</li>
                </ol>
                <p class="mt-2">You will receive an email confirmation shortly after successful payment.</p>
            `,
            category: "Bookings",
            icon: <Bookmark size={20} className="text-blue-500 mr-2" />
        },
        {
            id: 2,
            question: "What payment methods do you accept?",
            answer: `
                <p>We strive to offer a variety of convenient and secure payment options:</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li>Major Credit/Debit Cards (Visa, MasterCard, American Express, Discover)</li>
                    <li>Online Bank Transfers (for select regions)</li>
                    <li>Popular local payment gateways (e.g., Paystack, Flutterwave for Nigeria)</li>
                    <li>Mobile Money (for select African countries)</li>
                </ul>
                <p class="mt-2">All transactions are secured with the latest encryption technology.</p>
            `,
            category: "Payments",
            icon: <CreditCard size={20} className="text-green-500 mr-2" />
        },
        {
            id: 3,
            question: "Can I change or cancel my flight booking?",
            answer: `
                <p>Changes and cancellations depend on the fare rules of your purchased ticket and the airline's policy.</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Flexible Fares:</strong> Often allow changes or cancellations with minimal or no fees.</li>
                    <li><strong>Economy/Basic Fares:</strong> May incur significant change/cancellation fees, or may be non-refundable/non-changeable.</li>
                </ul>
                <p class="mt-2">To request a change or cancellation, please go to 'Manage My Booking' on our website or contact our customer support team directly with your booking reference.</p>
            `,
            category: "Bookings",
            icon: <Bookmark size={20} className="text-blue-500 mr-2" />
        },
        {
            id: 4,
            question: "What is the baggage allowance for my flight?",
            answer: `
                <p>Baggage allowance varies greatly depending on the airline, fare type, and destination. Generally, it falls into two categories:</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Carry-on/Hand Baggage:</strong> Typically one small bag and a personal item. Check dimensions and weight limits as these are strict.</li>
                    <li><strong>Checked Baggage:</strong> The number of bags, weight, and dimensions vary. Some basic economy fares may not include checked baggage, requiring an additional fee.</li>
                </ul>
                <p class="mt-2">Always refer to your e-ticket or the airline's official website for the exact baggage policy specific to your booking to avoid unexpected charges at the airport.</p>
            `,
            category: "Luggage",
            icon: <BriefcaseBusiness  size={20} className="text-orange-500 mr-2" />
        },
        {
            id: 5,
            question: "When should I check-in for my flight?",
            answer: `
                <p>We recommend the following check-in times to ensure a smooth boarding process:</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Domestic Flights:</strong> Arrive at the airport at least 2 hours before departure. Online check-in typically opens 24 hours prior.</li>
                    <li><strong>International Flights:</strong> Arrive at the airport at least 3 hours before departure. Online check-in typically opens 24-48 hours prior.</li>
                </ul>
                <p class="mt-2">Online check-in is highly recommended to save time at the airport. You can often select your seat and get your boarding pass in advance.</p>
            `,
            category: "Check-in & Boarding",
            icon: <UserCheck size={20} className="text-teal-500 mr-2" />
        },
        {
            id: 6,
            question: "What should I do if my flight is delayed or cancelled?",
            answer: `
                <p>In the event of a flight delay or cancellation, we understand it can be frustrating. Here's what to do:</p>
                <ol class="list-decimal list-inside space-y-1 mt-2">
                    <li><strong>Check Your Email/SMS:</strong> Airlines often send direct notifications.</li>
                    <li><strong>Check Flight Status:</strong> Use our website's 'Flight Status' tracker or the airline's official app.</li>
                    <li><strong>Contact Airline Directly:</strong> For rebooking options or compensation details, it's best to reach out to the airline directly, especially for significant delays or cancellations.</li>
                    <li><strong>Speak to Airport Staff:</strong> If at the airport, approach the airline's customer service desk.</li>
                </ol>
                <p class="mt-2">Your rights as a passenger for delays and cancellations may vary based on region (e.g., EU261 for flights within/to/from Europe).</p>
            `,
            category: "Flights",
            icon: <Plane size={20} className="text-indigo-500 mr-2" />
        },
        {
            id: 7,
            question: "Do you offer travel insurance?",
            answer: `
                <p>While VoyageEase does not directly provide travel insurance, we partner with reputable insurance providers to offer comprehensive coverage options during your booking process.</p>
                <p class="mt-2">We highly recommend purchasing travel insurance to protect yourself against unforeseen circumstances such as trip cancellations, medical emergencies, lost luggage, and travel delays. You will have the option to add insurance during the checkout phase of your booking.</p>
            `,
            category: "General Policies",
            icon: <ClipboardList size={20} className="text-purple-500 mr-2" />
        },
        {
            id: 8,
            question: "How can I contact customer support?",
            answer: `
                <p>Our customer support team is here to assist you!</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Online Chat:</strong> Available on our website for immediate assistance during business hours.</li>
                    <li><strong>Contact Form:</strong> Fill out the form on our 'Contact Us' page for non-urgent inquiries.</li>
                    <li><strong>Phone Support:</strong> Call us at +234 801 234 5678 (Mon-Fri, 9 AM - 5 PM WAT).</li>
                    <li><strong>Email:</strong> Send us an email at support@voyageease.com.</li>
                </ul>
                <p class="mt-2">For urgent matters related to your active booking, please refer to the emergency contact details on your confirmation email.</p>
            `,
            category: "Customer Support",
            icon: <Headphones size={20} className="text-red-500 mr-2" />
        },
        {
            id: 9,
            question: "What is your loyalty program?",
            answer: `
                <p>Our 'VoyageMiles' loyalty program rewards our frequent travelers with exclusive benefits and discounts.</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Earn Miles:</strong> Accumulate miles with every flight booked through VoyageEase.</li>
                    <li><strong>Redeem Rewards:</strong> Use your miles to get discounts on future flights, hotel stays, or upgrade services.</li>
                    <li><strong>Exclusive Perks:</strong> Gain access to priority boarding, lounge access, and special offers as you reach higher tiers.</li>
                </ul>
                <p class="mt-2">Sign up for free on our website under the 'Loyalty Program' section to start earning today!</p>
            `,
            category: "Loyalty Program",
            icon: <Smile size={20} className="text-yellow-500 mr-2" />
        },
        {
            id: 10,
            question: "How do I check my flight status?",
            answer: `
                <p>You can easily check the real-time status of any flight on our website.</p>
                <ol class="list-decimal list-inside space-y-1 mt-2">
                    <li>Go to the 'Flight Status' tab on our homepage.</li>
                    <li>Enter the airline name and flight number OR the departure and arrival airports.</li>
                    <li>Select the date of travel.</li>
                    <li>Click 'Check Status'.</li>
                </ol>
                <p class="mt-2">This will provide you with up-to-date information on departures, arrivals, delays, and gate changes.</p>
            `,
            category: "Flights",
            icon: <Plane size={20} className="text-indigo-500 mr-2" />
        },
        {
            id: 11,
            question: "Are there any restrictions on liquids in carry-on baggage?",
            answer: `
                <p>Yes, strict restrictions apply to liquids, aerosols, and gels (LAGs) in carry-on baggage for most international and domestic flights.</p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                    <li>Containers must be 100 milliliters (3.4 ounces) or less.</li>
                    <li>All containers must fit in a single transparent, re-sealable plastic bag of 1-liter capacity (approx. 20cm x 20cm).</li>
                    <li>Each passenger is limited to one such bag.</li>
                </ul>
                <p class="mt-2">Exceptions are made for essential medicines, baby formula/food, and special dietary requirements. Please check your local aviation authority's guidelines (e.g., TSA for USA, CAA for UK) for specific details.</p>
            `,
            category: "Luggage",
            icon: <BriefcaseBusiness size={20} className="text-orange-500 mr-2" />
        },
        {
            id: 12,
            question: "How do I add special assistance to my booking?",
            answer: `
                <p>If you or a travel companion require special assistance (e.g., wheelchair assistance, medical equipment, unaccompanied minor service), please notify us at the time of booking or as soon as possible thereafter.</p>
                <p class="mt-2">You can usually add special assistance requests through the 'Manage My Booking' section, or by contacting our customer support team directly. Providing details in advance ensures we can make the necessary arrangements with the airline to ensure a comfortable and safe journey.</p>
            `,
            category: "General Policies",
            icon: <ClipboardList size={20} className="text-purple-500 mr-2" />
        },
    ], []);

    const categories = useMemo(() => [
        { name: "All", icon: <HelpCircle size={20} className="mr-2" />, count: faqs.length },
        { name: "Bookings", icon: <Bookmark size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Bookings").length },
        { name: "Payments", icon: <CreditCard size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Payments").length },
        { name: "Flights", icon: <Plane size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Flights").length },
        { name: "Luggage", icon: <BriefcaseBusiness size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Luggage").length },
        { name: "Check-in & Boarding", icon: <UserCheck size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Check-in & Boarding").length },
        { name: "General Policies", icon: <ClipboardList size={20} className="mr-2" />, count: faqs.filter(f => f.category === "General Policies").length },
        { name: "Loyalty Program", icon: <Smile size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Loyalty Program").length },
        { name: "Customer Support", icon: <Headphones size={20} className="mr-2" />, count: faqs.filter(f => f.category === "Customer Support").length },
    ], [faqs]);


    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [openFAQIndex, setOpenFAQIndex] = useState(null); // State for FAQ accordion

    const filteredFaqs = useMemo(() => {
        let currentFaqs = faqs;

        if (activeCategory !== 'All') {
            currentFaqs = currentFaqs.filter(faq => faq.category === activeCategory);
        }

        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            currentFaqs = currentFaqs.filter(faq =>
                faq.question.toLowerCase().includes(lowercasedSearchTerm) ||
                faq.answer.toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        return currentFaqs;
    }, [faqs, searchTerm, activeCategory]);

    const toggleFAQ = (index) => {
        setOpenFAQIndex(prevIndex => (prevIndex === index ? null : index));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-inter text-gray-800">

            {/* Hero Section */}
            <section className="relative h-[45vh] md:h-[55vh] flex items-center justify-center text-white overflow-hidden p-4 md:p-8">
                {/* Background Image/Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517404215737-02e07172f3e8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}
                >
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <HelpCircle size={80} className="mx-auto mb-4 text-white drop-shadow-lg" />
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl font-light opacity-90 tracking-wide">
                        Find quick answers to your travel queries.
                    </p>
                </div>
            </section>

            {/* Main FAQ Content Section */}
            <section className="relative z-20 bg-white rounded-t-3xl -mt-8 py-16 md:py-24 shadow-2xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto mb-12 animate-fade-in">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 pl-14 border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-lg"
                            />
                            <Search size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Categories Filter */}
                    <div className="mb-12 animate-fade-in-delay">
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center">
                            <Tag size={28} className="text-purple-600 mr-2" /> Browse by Category
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setActiveCategory(category.name);
                                        setOpenFAQIndex(null); // Close any open FAQs when changing category
                                    }}
                                    className={`
                                        px-5 py-2 rounded-full text-base font-semibold transition-all duration-300 flex items-center
                                        ${activeCategory === category.name
                                            ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-indigo-600'
                                        }
                                    `}
                                >
                                    {category.icon} {category.name} ({category.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-6 animate-fade-in-up-stagger">
                        {filteredFaqs.length > 0 ? (
                            // eslint-disable-next-line no-unused-vars
                            filteredFaqs.map((faq, index) => (
                                <FAQItem
                                    key={faq.id}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openFAQIndex === faq.id} // Use faq.id to control individual accordion
                                    toggle={() => toggleFAQ(faq.id)} // Pass faq.id to toggle
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-600 py-10 text-lg">
                                <p>No FAQs found matching your criteria.</p>
                                <p className="mt-2">Try a different search term or category.</p>
                            </div>
                        )}
                    </div>

                    {/* Still Need Help Section */}
                    <div className="mt-20 text-center bg-gradient-to-r from-blue-500 to-indigo-600 p-10 rounded-2xl shadow-xl text-white animate-slide-in-bottom">
                        <h2 className="text-3xl font-bold mb-4 drop-shadow-md">Still Need Help?</h2>
                        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                            If you couldn't find the answer you were looking for, our friendly support team is ready to assist you.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 group"
                        >
                            Contact Support <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
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

export default FAQ;
