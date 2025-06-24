// frontend/src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Plane,
    Building,
    Compass,
    Sparkles,
    Users,
    MapPin,
    Lightbulb,
    Target,
    Heart,
    Handshake,
    Globe,
    Briefcase,
    BookOpen,
    Smile,
    ArrowRight,
    MessageCircleMore,
    Star,
    Award,
    Quote,
    Phone,
    Mail,
    LocateFixed,
    Timer,
    Zap,
    Scale,
    Gem,
} from 'lucide-react';

function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800">

            {/* Hero Section */}
            <section className="relative h-[50vh] md:h-[65vh] flex items-center justify-center text-white overflow-hidden p-4 md:p-8">
                {/* Background Image/Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://www.shutterstock.com/image-photo/commercial-airplane-jetliner-flying-above-600nw-788233372.jpg')` }}
                >
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        About <span className="text-indigo-300">Air Classic Travel</span>
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl font-light mb-8 opacity-90 tracking-wide">
                        Your Trusted Partner in Seamless Global Exploration.
                    </p>
                    <Link
                        to="/flights"
                        className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 group"
                    >
                        Explore Flights <Plane size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 md:py-24 bg-white rounded-t-3xl -mt-8 relative z-20 shadow-2xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-down">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center">
                            <BookOpen size={36} className="text-blue-500 mr-3" /> Our Story
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Founded in 2023 by a team of passionate travelers and tech enthusiasts, Air Classic Travel was born from a simple idea: travel planning should be effortless, enjoyable, and accessible to everyone. We recognized the complexities and frustrations often associated with booking flights and hotels, and set out to create a solution that prioritizes convenience, transparency, and a truly personalized experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-lg text-gray-700 leading-relaxed space-y-6 animate-slide-in-left">
                            <p>
                                What started as a small project to simplify our own travel needs quickly grew into a mission to empower fellow adventurers. We dedicated ourselves to building a robust platform that not only offers competitive prices and a vast selection but also provides intuitive tools and reliable support every step of the way.
                            </p>
                            <p>
                                From our humble beginnings, we've remained committed to innovation, continuously refining our technology and expanding our partnerships to bring you the best travel options globally. Air Classic Travel isn't just a booking platform; it's a community built on the shared joy of discovering new horizons.
                            </p>
                            <Link to="/contact" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mt-4 transition-colors">
                                Contact Our Team <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                        <div className="relative animate-slide-in-right">
                            <img
                                src="https://www.shutterstock.com/image-photo/group-cabin-crew-air-hostess-600nw-1866984784.jpg](https://www.shutterstock.com/image-photo/group-cabin-crew-air-hostess-600nw-1866984784.jpg" // <-- CORRECTED URL HERE
                                alt="Our Story Visual"
                                className="w-full h-auto rounded-xl shadow-2xl transform hover:scale-[1.01] transition-transform duration-300"
                                onError={(e) => { e.target.onerror = null; e.target.src="[https://placehold.co/600x400/d1d5db/333333?text=Image+Not+Found](https://placehold.co/600x400/d1d5db/333333?text=Image+Not+Found)" }} // Added a more specific placeholder fallback
                            />
                            <div className="absolute -bottom-4 -left-4 bg-yellow-400 p-4 rounded-full shadow-lg animate-bounce-slow">
                                <Lightbulb size={32} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-200 animate-fade-in-left">
                            <div className="text-center mb-6">
                                <Target size={56} className="text-indigo-600 mx-auto mb-4" />
                                <h3 className="text-3xl font-bold text-gray-800">Our Mission</h3>
                            </div>
                            <p className="text-lg text-gray-700 leading-relaxed text-center">
                                To simplify travel for everyone, everywhere. We aim to be the most trusted and intuitive platform for booking flights and hotels, empowering individuals to explore the world with confidence and ease.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-200 animate-fade-in-right">
                            <div className="text-center mb-6">
                                <Sparkles size={56} className="text-blue-600 mx-auto mb-4" />
                                <h3 className="text-3xl font-bold text-gray-800">Our Vision</h3>
                            </div>
                            <p className="text-lg text-gray-700 leading-relaxed text-center">
                                To create a world where travel planning is as joyful as the journey itself, fostering connections, cultural understanding, and unforgettable memories for millions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-down">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center">
                            <Heart size={36} className="text-red-500 mr-3" /> Our Core Values
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            These principles guide every decision we make and every interaction we have.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ValueCard
                            icon={<Smile size={40} className="text-yellow-500" />}
                            title="Customer Centricity"
                            description="We place our users at the heart of everything we do, striving to exceed expectations with exceptional service and support."
                        />
                        <ValueCard
                            icon={<Lightbulb size={40} className="text-purple-500" />}
                            title="Innovation"
                            description="We embrace creativity and continuous improvement, leveraging cutting-edge technology to offer smarter travel solutions."
                        />
                        <ValueCard
                            icon={<Handshake size={40} className="text-green-500" />}
                            title="Integrity"
                            description="We operate with honesty, transparency, and ethical practices, building trust with our users and partners."
                        />
                        <ValueCard
                            icon={<Globe size={40} className="text-blue-500" />}
                            title="Global Accessibility"
                            description="We believe travel should be for everyone, working to make our platform intuitive and inclusive for a diverse global audience."
                        />
                        <ValueCard
                            icon={<Zap size={40} className="text-orange-500" />}
                            title="Efficiency"
                            description="We streamline processes and optimize performance to provide quick, reliable, and hassle-free booking experiences."
                        />
                        <ValueCard
                            icon={<Scale size={40} className="text-gray-500" />}
                            title="Sustainability"
                            description="We are committed to promoting responsible travel and minimizing our environmental impact where possible."
                        />
                    </div>
                </div>
            </section>

            {/* Meet the Team Section (Conceptual) */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-blue-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-down">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center">
                            <Users size={36} className="text-indigo-600 mr-3" /> Meet Our Team
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Behind every seamless booking is a dedicated team passionate about your journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TeamCard
                            image="https://www.shutterstock.com/image-photo/woman-airport-passenger-assistant-arms-600nw-2263208235.jpg"
                            name="Jane Doe"
                            role="CEO & Co-Founder"
                            bio="Visionary leader passionate about connecting people through travel."
                        />
                        <TeamCard
                            image="https://www.shutterstock.com/shutterstock/videos/1067051005/thumb/10.jpg?ip=x480"
                            name="John Smith"
                            role="CTO & Co-Founder"
                            bio="Architect of our intuitive platform, constantly pushing technological boundaries."
                        />
                        <TeamCard
                            image="https://thetravelbible.com/wp-content/uploads/2024/06/flight-attendant.png"
                            name="Emily Chen"
                            role="Head of Customer Success"
                            bio="Ensuring every user has an unparalleled experience with our support."
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials/Accolades (Optional but good for 'professional' look) */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-down">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center">
                            <Quote size={36} className="text-purple-600 mr-3" /> What Our Users Say
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Hear from the travelers who choose Air Classic Travel for their adventures.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TestimonialCard
                            quote="Air Classic Travel made booking my family vacation incredibly easy. The interface is clean, and customer support was exceptional!"
                            author="Sarah L."
                            rating={5}
                        />
                        <TestimonialCard
                            quote="I travel frequently for business, and Air Classic Travel consistently finds me the best deals on flights and hotels without any hassle."
                            author="David M."
                            rating={5}
                        />
                    </div>
                </div>
            </section>


            {/* Call to Action at the bottom */}
            <section className="py-16 md:py-24 bg-indigo-400 text-white text-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Begin Your Next Adventure?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                        Join thousands of happy travelers who trust Air Classic Travel for their flight and hotel bookings. Your journey starts here.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 group"
                    >
                        Get Started Today <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Reusable Value Card Component
const ValueCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:border-blue-200 transition-all duration-300 animate-fade-in">
        <div className="mb-4 p-3 bg-gray-50 rounded-full shadow-inner flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

// Reusable Team Card Component
const TeamCard = ({ image, name, role, bio }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 animate-fade-in">
        <img
            src={image}
            alt={name}
            className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-indigo-200 shadow-md"
            // Fallback for image loading error
            onError={(e) => { e.target.onerror = null; e.target.src="[https://placehold.co/150x150/d1d5db/333333?text=User](https://placehold.co/150x150/d1d5db/333333?text=User)" }}
        />
        <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
        <p className="text-indigo-600 font-semibold mb-3">{role}</p>
        <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
    </div>
);

// Reusable Testimonial Card Component
const TestimonialCard = ({ quote, author, rating }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 animate-fade-in">
        <Quote size={32} className="text-purple-400 mb-4" />
        <p className="text-lg text-gray-700 italic mb-4">"{quote}"</p>
        <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">- {author}</p>
            <div className="flex">
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-400 fill-current" />
                ))}
                {[...Array(5 - rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-gray-300" />
                ))}
            </div>
        </div>
    </div>
);

export default About;