// Careers.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Users } from 'lucide-react';

function Careers() {
    const jobOpenings = [
        {
            id: 1,
            title: "Experienced Flight Attendant",
            location: "Lagos, Nigeria (Base)",
            salary: "NGN 3,500,000 - 5,000,000 / year",
            type: "Full-time",
            department: "Cabin Crew",
            description: "We're looking for enthusiastic and service-oriented Flight Attendants to ensure the safety and comfort of our passengers. You'll be the face of our airline, providing exceptional in-flight service and handling various situations with professionalism.",
            requirements: [
                "Minimum 2 years of experience as a Flight Attendant.",
                "Valid Cabin Crew Attestation (CCA) or equivalent.",
                "Excellent communication and interpersonal skills.",
                "Ability to work irregular hours, including nights, weekends, and holidays.",
                "Fluent in English; additional languages (e.g., French, Arabic) are a plus.",
                "Strong problem-solving abilities and a calm demeanor under pressure."
            ]
        },
        {
            id: 2,
            title: "Senior Aviation Mechanic (Airframe & Powerplant)",
            location: "Lagos, Nigeria (Airport Hangar)",
            salary: "NGN 6,000,000 - 9,000,000 / year",
            type: "Full-time",
            department: "Maintenance & Engineering",
            description: "Join our dedicated maintenance team ensuring the airworthiness of our fleet. You will perform inspections, repairs, and preventative maintenance on aircraft airframes, engines, and systems according to regulatory standards.",
            requirements: [
                "5+ years of experience as an Aviation Mechanic.",
                "Valid Airframe & Powerplant (A&P) license or equivalent certification.",
                "In-depth knowledge of aircraft systems and diagnostic procedures.",
                "Experience with Boeing or Airbus aircraft types preferred.",
                "Ability to read and interpret technical manuals and blueprints.",
                "Strong attention to detail and commitment to safety protocols."
            ]
        },
        {
            id: 3,
            title: "Customer Service & Reservations Agent",
            location: "Remote (Global, various timezones)",
            salary: "$22 - $28 / hour",
            type: "Full-time / Part-time",
            department: "Customer Operations",
            description: "Be the first point of contact for our customers, assisting them with flight bookings, changes, cancellations, and general inquiries. You'll provide friendly, efficient, and accurate support, ensuring a positive experience for every traveler.",
            requirements: [
                "2+ years of experience in customer service, preferably in travel or hospitality.",
                "Excellent verbal and written communication skills.",
                "Proficiency with reservation systems (e.g., Amadeus, Sabre, Galileo) is a strong plus.",
                "Ability to multitask and navigate multiple systems simultaneously.",
                "Strong problem-solving skills and a customer-first attitude.",
                "Flexibility to work shifts, including evenings and weekends."
            ]
        },
        {
            id: 4,
            title: "Airport Operations Coordinator",
            location: "Accra, Ghana (Kotoka International Airport)",
            salary: "GHS 35,000 - 50,000 / year",
            type: "Full-time",
            department: "Ground Operations",
            description: "Coordinate various ground operations to ensure timely and safe aircraft departures and arrivals. You'll work closely with ground staff, air traffic control, and cabin crew to maintain efficient airport operations.",
            requirements: [
                "Bachelor's degree in Aviation Management or related field, or equivalent experience.",
                "1+ year of experience in airport or airline operations.",
                "Knowledge of airport regulations and safety procedures.",
                "Strong organizational and and communication skills.",
                "Ability to work in a fast-paced, dynamic environment.",
                "Proficiency in relevant operational software is a plus."
            ]
        },
        {
            id: 5,
            title: "Airline Pilot (First Officer)",
            location: "Global (Various Bases)",
            salary: "Competitive, based on experience and type rating",
            type: "Full-time",
            department: "Flight Operations",
            description: "We are expanding our fleet and seeking highly qualified and dedicated First Officers to join our flight crew. You will assist the Captain in all aspects of flight operations, ensuring the highest standards of safety and efficiency.",
            requirements: [
                "Valid Commercial Pilot License (CPL) or Airline Transport Pilot License (ATPL).",
                "Minimum 1,500 hours total flight time, with specific multi-engine and instrument ratings.",
                "Type rating on relevant aircraft (e.g., Boeing 737, Airbus A320) preferred.",
                "Excellent command of English (ICAO Level 4 or higher).",
                "Strong decision-making skills and ability to work effectively in a crew environment.",
                "Valid Class 1 Medical Certificate."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-inter text-gray-800 py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <Link
                    to="/"
                    className="inline-flex items-center text-purple-700 hover:text-purple-900 font-semibold transition-colors mb-8 text-lg"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    <div className="relative p-8 md:p-12 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center">
                        <Briefcase size={60} className="mx-auto mb-4 opacity-80" />
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg mb-3">
                            Soar with Us!
                        </h1>
                        <p className="text-xl md:text-2xl font-light opacity-90">
                            Explore career opportunities and help us connect the world through travel.
                        </p>
                    </div>

                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Current Job Openings</h2>

                        {jobOpenings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {jobOpenings.map((job) => (
                                    <div key={job.id} className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 animate-fade-in-up-stagger">
                                        <h3 className="text-2xl font-bold text-indigo-700 mb-3">{job.title}</h3>
                                        <p className="text-gray-600 mb-4">{job.description}</p>

                                        <div className="space-y-2 text-gray-700 text-sm mb-5">
                                            <div className="flex items-center">
                                                <MapPin size={18} className="mr-2 text-purple-500" /> {job.location}
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign size={18} className="mr-2 text-green-600" /> {job.salary}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock size={18} className="mr-2 text-blue-500" /> {job.type}
                                            </div>
                                            <div className="flex items-center">
                                                <Users size={18} className="mr-2 text-orange-500" /> {job.department}
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                {job.requirements.map((req, idx) => (
                                                    <li key={idx}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Updated Button to Link to Application Form */}
                                        <Link
                                            to={`/apply/${job.id}`}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md text-center inline-block"
                                        >
                                            Apply Now
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 italic text-lg">No job openings at the moment. Please check back soon!</p>
                        )}
                    </div>
                </div>

                ---

                {/* Culture Section */}
                <div className="mt-16 bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fade-in-up-delay">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Culture: Where Careers Take Flight</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                        At our airline, we're not just about flights; we're about fostering a **vibrant community** that shares a passion for connecting people and places. We champion a culture of **safety, excellence, and teamwork**, where every crew member and ground staff plays a vital role in our journey.
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        We invest in **continuous learning and professional development** to help your career take off. Join us and be part of a diverse, global team dedicated to delivering unforgettable travel experiences.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Careers;