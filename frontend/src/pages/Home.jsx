// frontend/src/pages/Home.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // To check if user is logged in

// Import icons for the "Why Choose Us" section
import { Globe, ShieldCheck, HeartHandshake, Award, Search, Plane, Users } from 'lucide-react';

function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col bg-gray-50">
            {/* Hero Section */}
            <section
                className="relative bg-cover bg-center h-[600px] md:h-[700px] flex items-center justify-center text-white p-4 overflow-hidden" // Added overflow-hidden for subtle parallax
                style={{ backgroundImage: "url('https://www.shutterstock.com/image-photo/passenger-airplane-on-cloudy-sky-600nw-1467319073.jpg')" }}
            >
                {/* Overlay with subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black opacity-60"></div>
                
                <div className="relative z-10 text-center max-w-4xl animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-2xl animate-fade-in-down-slow"> {/* Stronger shadow, new animation */}
                        Your Journey Begins with <span className="text-indigo-300">Air Classic Travel</span>
                    </h1>
                    <p className="text-lg md:text-xl font-light mb-8 drop-shadow-lg animate-fade-in-slow">
                        Discover seamless flights, luxurious hotels, and unforgettable adventures.
                        Travel with confidence and experience the world.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <Link
                            to="/flights"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition duration-500 ease-in-out transform hover:scale-105 shadow-xl flex items-center justify-center group relative overflow-hidden"
                        >
                            <Plane size={24} className="mr-2 group-hover:rotate-6 transition-transform duration-500" />
                            Explore Flights
                            <span className="absolute inset-0 border-2 border-transparent group-hover:border-white rounded-full transition-all duration-500"></span> {/* Border glow */}
                        </Link>
                        {!user && (
                            <Link
                                to="/register"
                                className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-indigo-700 transition duration-500 ease-in-out transform hover:scale-105 shadow-xl flex items-center justify-center group relative overflow-hidden"
                            >
                                <Users size={24} className="mr-2 group-hover:scale-110 transition-transform duration-500" />
                                Join Us
                                <span className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500 rounded-full transition-all duration-500"></span> {/* Border glow */}
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-blue-100"> {/* Lighter gradient start */}
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 animate-fade-in-up">Why Choose Air Classic Travel?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Globe size={48} className="text-indigo-500 group-hover:animate-spin-slow" />} 
                            title="Global Network"
                            description="Access to thousands of destinations worldwide with leading airlines."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={48} className="text-green-500 group-hover:scale-125 transition-transform duration-300" />}
                            title="Secure Bookings"
                            description="Your safety and privacy are our top priorities. Book with confidence."
                        />
                        <FeatureCard
                            icon={<HeartHandshake size={48} className="text-red-500 group-hover:animate-pulse" />} 
                            title="24/7 Support"
                            description="Dedicated customer service available around the clock to assist you."
                        />
                        <FeatureCard
                            icon={<Award size={48} className="text-yellow-500 group-hover:-rotate-12 transition-transform duration-300" />}
                            title="Best Price Guarantee"
                            description="We strive to offer the most competitive prices on flights and hotels."
                        />
                        <FeatureCard
                            icon={<Search size={48} className="text-purple-500 group-hover:scale-125 transition-transform duration-300" />}
                            title="Effortless Search"
                            description="Intuitive and powerful search tools to find your perfect trip quickly."
                        />
                         <FeatureCard
                            icon={<Users size={48} className="text-teal-500 group-hover:translate-y-[-5px] transition-transform duration-300" />}
                            title="Personalized Experience"
                            description="Tailored recommendations and services to match your unique travel style."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Destinations/Offers Section (Left/Right Layout) */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center animate-fade-in-up">Popular Destinations</h2>
                    
                    {/* Feature 1: Exotic Beaches */}
                    <div className="flex flex-col md:flex-row items-center gap-10 mb-16 md:mb-24 animate-fade-in-left">
                        <div className="md:w-1/2 group">
                            <img
                                src="https://images.saymedia-content.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:eco%2Cw_1200/MTc2MjY4NDcxMDE2OTU3MTAx/tropical-beach-pictures.jpg"
                                alt="Exotic Beach"
                                className="rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-102 hover:shadow-2xl group-hover:brightness-90" // Image brightness on hover
                            />
                        </div>
                        <div className="md:w-1/2 text-center md:text-left animate-fade-in-right">
                            <h3 className="text-3xl font-bold text-indigo-700 mb-4">Escape to Paradise</h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                Indulge in the sun-kissed beaches and turquoise waters of the world's most exotic islands.
                                Find your perfect retreat with our curated hotel selections and direct flights.
                            </p>
                            <Link to="/flights" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition duration-300 group">
                                Book Your Beach Getaway <span className="ml-1 text-xl group-hover:translate-x-1 transition-transform duration-300">&rarr;</span> {/* Arrow animation */}
                            </Link>
                        </div>
                    </div>

                    {/* Feature 2: Vibrant Cities (reversed layout) */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-10 mb-16 md:mb-24 animate-fade-in-right">
                        <div className="md:w-1/2 group">
                            <img
                                src="https://media.istockphoto.com/id/1156527160/photo/new-york-streets-high-buildings-and-crowd-walking.jpg?s=612x612&w=0&k=20&c=iPr6buP-X6Iv-OQ2SQofNwFw53UfLldsz6Tf4KNgdzE="
                                alt="Vibrant City"
                                className="rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-102 hover:shadow-2xl group-hover:brightness-90"
                            />
                        </div>
                        <div className="md:w-1/2 text-center md:text-right animate-fade-in-left">
                            <h3 className="text-3xl font-bold text-indigo-700 mb-4">Explore Bustling Metropolises</h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                Immerse yourself in the culture, history, and vibrant nightlife of iconic cities.
                                From ancient wonders to modern marvels, adventure awaits.
                            </p>
                            <Link to="/hotels" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition duration-300 group">
                                Discover City Breaks <span className="ml-1 text-xl group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Feature 3: Nature & Adventure */}
                    <div className="flex flex-col md:flex-row items-center gap-10 animate-fade-in-left">
                        <div className="md:w-1/2 group">
                            <img
                                src="https://plus.unsplash.com/premium_photo-1667516408599-67d72068eaa9?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWR2ZW50dXJlJTIwdHJhdmVsfGVufDB8fDB8fHww"
                                alt="Nature Adventure"
                                className="rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-102 hover:shadow-2xl group-hover:brightness-90"
                            />
                        </div>
                        <div className="md:w-1/2 text-center md:text-left animate-fade-in-right">
                            <h3 className="text-3xl font-bold text-indigo-700 mb-4">Adventure in the Wild</h3>
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                For the thrill-seekers and nature lovers, our adventure packages take you to breathtaking
                                landscapes and offer exhilarating experiences.
                            </p>
                            <Link to="/flights" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition duration-300 group">
                                Plan Your Adventure <span className="ml-1 text-xl group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gradient-to-t from-gray-100 to-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 animate-fade-in-up">What Our Travelers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Air Classic Travel made booking my family vacation incredibly easy. The interface is intuitive and support was fantastic!"
                            author="— Jane Doe, Family Traveler"
                        />
                        <TestimonialCard
                            quote="I found the best flight deal for my business trip here. Seamless booking and clear communication. Highly recommended!"
                            author="— John Smith, Business Traveler"
                        />
                        <TestimonialCard
                            quote="From planning to execution, every step was smooth. Air Classic Travel truly delivers on its promise of classic service."
                            author="— Emily Chen, Solo Explorer"
                        />
                    </div>
                </div>
            </section>

            {/* Final Call to Action Section */}
            <section
                className="py-20 bg-cover bg-center text-white text-center relative overflow-hidden"
                style={{ backgroundImage: "url('https://res.cloudinary.com/activeadventures/image/upload/f_auto/q_auto/v1743999239/puqe5z5iakutqxdbkvr0?_a=BAAAV6DQ')" }}
            >
                {/* Overlay with darker tint for text contrast */}
                <div className="absolute inset-0 bg-indigo-900 opacity-50"></div>
                <div className="relative z-10 container mx-auto px-4 animate-fade-in-up">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-lg animate-fade-in-down-slow">Ready for Your Next Adventure?</h2>
                    <p className="text-lg md:text-xl mb-8 animate-fade-in-slow">
                        Start exploring amazing destinations and unparalleled travel experiences today.
                    </p>
                    <Link
                        to="/flights"
                        className="bg-yellow-400 text-gray-900 px-10 py-4 rounded-full text-xl font-bold hover:bg-yellow-500 transition duration-500 ease-in-out transform hover:scale-110 shadow-xl inline-flex items-center group relative overflow-hidden"
                    >
                        <Plane size={28} className="mr-3 group-hover:rotate-6 transition-transform duration-500" />
                        Find Your Flight Now
                        <span className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-200 rounded-full transition-all duration-500"></span>
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col items-center text-center border border-gray-100 group"> {/* Added group for icon hover */}
        <div className="mb-4 text-indigo-600">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
);

// Reusable Testimonial Card Component
const TestimonialCard = ({ quote, author }) => (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 transition-all duration-300 hover:scale-102 hover:shadow-xl hover:translate-y-[-5px]"> {/* Added translate-y on hover */}
        <p className="text-gray-700 italic text-lg mb-4">"{quote}"</p>
        <p className="text-gray-500 font-semibold text-sm">{author}</p>
    </div>
);

export default Home;