// frontend/src/pages/Blog.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Newspaper,
    Calendar,
    UserCircle,
    ArrowRight,
    Search,
    Tag,
    Star,
    Mail,
    ChevronRight,
} from 'lucide-react';

function Blog() {
    // Wrap blogPosts in useMemo to prevent re-creation on every render
    const blogPosts = useMemo(() => [
        {
            id: 1,
            title: "Exploring the Hidden Gems of Southeast Asia",
            excerpt: "From ancient temples shrouded in mist to bustling night markets, Southeast Asia offers an unparalleled adventure. Discover secret beaches, vibrant cultures, and culinary delights that will captivate your senses.",
            image: "https://flipflopdaily.com/wp-content/uploads/2024/09/Square_Sep18_Exploring-Hidden-Gems-in-Southeast-Asia-ezgif.com-optijpeg.jpg",
            author: "Travel Enthusiast",
            date: "June 20, 2024",
            slug: "hidden-gems-southeast-asia",
            category: "Adventure",
        },
        {
            id: 2,
            title: "Your First Solo Trip: A Guide to Confidence and Safety",
            excerpt: "Embarking on a solo journey can be transformative. This guide covers essential tips for planning, staying safe, managing your budget, and embracing the freedom of traveling alone.",
            image: "https://www.solosophie.com/wp-content/uploads/2018/05/Planning-your-first-solo-trip.jpg",
            author: "Solo Explorer",
            date: "June 15, 2024",
            slug: "first-solo-trip-guide",
            category: "Tips & Guides",
        },
        {
            id: 3,
            title: "Top 5 Eco-Friendly Destinations for Sustainable Travel",
            excerpt: "Travel responsibly and explore destinations that prioritize environmental conservation and local community well-being. Learn about sustainable practices and how you can contribute.",
            image: "https://d1ss4nmhr4m5he.cloudfront.net/wp-content/uploads/2023/12/04080730/Top-5-Sustainable-Travel-Options-That-Every-Business-Traveler-Should-Know-min-1024x538-1.jpg",
            author: "Green Traveler",
            date: "June 10, 2024",
            slug: "eco-friendly-destinations",
            category: "Sustainable Travel",
        },
        {
            id: 4,
            title: "Budget Travel Hacks: See the World Without Breaking the Bank",
            excerpt: "Traveling on a budget doesn't mean sacrificing adventure. Discover smart strategies for saving on flights, accommodation, food, and activities to make your travel dreams a reality.",
            image: "https://surffares.com/travelguru/wp-content/uploads/2023/12/Budget-Travel-Hacks-to-Save-Your-Money-blog.jpg",
            author: "Frugal Wanderer",
            date: "June 05, 2024",
            slug: "budget-travel-hacks",
            category: "Tips & Guides",
        },
        {
            id: 5,
            title: "The Ultimate Foodie Tour: A Culinary Journey Through Italy",
            excerpt: "Indulge in the rich flavors of Italy, from authentic pasta in Rome to fresh seafood on the Amalfi Coast. This guide takes you through the must-try dishes and best eateries.",
            image: "https://i.ytimg.com/vi/haUKaPAJRRo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCAXQWoEfJZa_1XG7EUQs_8uO8XQA",
            author: "Gourmet Traveler",
            date: "May 30, 2024",
            slug: "foodie-tour-italy",
            category: "Food & Culture",
        },
        {
            id: 6,
            title: "Adventures in the Amazon: A Guide to Rainforest Exploration",
            excerpt: "Immerse yourself in the incredible biodiversity of the Amazon rainforest. Learn about ethical wildlife viewing, eco-lodges, and the unforgettable experiences awaiting you.",
            image: "https://weareglobaltravellers.com/wp-content/uploads/2021/10/Wheres-Mollie-An-ecofriendly-guide-to-visiting-the-Amazon-11-760x507.jpg",
            author: "Nature Lover",
            date: "May 25, 2024",
            slug: "adventures-amazon",
            category: "Adventure",
        },
        {
            id: 7,
            title: "Winter Wonderland: Skiing in the Alps",
            excerpt: "Experience the thrill of skiing in the majestic Alps. This guide covers the best resorts, tips for beginners, and breathtaking views.",
            image: "https://www.thetrainline.com/cms/media/7627/femaleskieralps-609059786.jpg?mode=crop&width=1080&height=1080&quality=70",
            author: "Snow Enthusiast",
            date: "May 20, 2024",
            slug: "skiing-alps",
            category: "Adventure",
        },
        {
            id: 8,
            title: "Cultural Immersion in Kyoto, Japan",
            excerpt: "Discover the ancient traditions and serene beauty of Kyoto. From historic temples to tranquil gardens, immerse yourself in Japanese culture.",
            image: "https://pelorus-statamic.s3.eu-west-2.amazonaws.com/images/geisha-street.jpg",
            author: "Culture Seeker",
            date: "May 18, 2024",
            slug: "kyoto-cultural-immersion",
            category: "Food & Culture",
        },
        {
            id: 9,
            title: "Photography Tips for Stunning Travel Photos",
            excerpt: "Learn how to capture breathtaking travel moments. This guide covers composition, lighting, and editing techniques for stunning photos.",
            image: "https://expertvagabond.com/wp-content/uploads/travel-photography-tips-guide-1.jpg",
            author: "Photo Pro",
            date: "May 12, 2024",
            slug: "travel-photography-tips",
            category: "Photography",
        },
        {
            id: 10,
            title: "Sustainable Backpacking: Leave No Trace",
            excerpt: "Learn how to minimize your environmental impact while backpacking. Tips on eco-friendly gear, waste management, and responsible hiking.",
            image: "https://www.backpacker.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:auto%2Cq_auto:good%2Cw_620/MTg5MTgwODQxOTg2OTE0MzY4/i-hiked-200-miles-in-cheap-costco-hiking-shoes-and-my-feet-are-doing-fine-hero.jpg",
            author: "Eco Hiker",
            date: "May 08, 2024",
            slug: "sustainable-backpacking",
            category: "Sustainable Travel",
        },
    ], []); // Empty dependency array means it only runs once on mount

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; // Display 6 posts per page

    // Calculate total pages and posts for the current page
    const totalPages = Math.ceil(blogPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = useMemo(() => blogPosts.slice(indexOfFirstPost, indexOfLastPost), [blogPosts, indexOfFirstPost, indexOfLastPost]);

    // Function to change page
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };

    // Helper to generate page numbers to display in pagination
    const getPaginationGroup = () => {
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, currentPage + 1);

        // Adjust start/end if near boundaries to keep 3 page numbers visible when possible
        if (totalPages >= 3) {
            if (currentPage === 1) {
                end = 3;
            } else if (currentPage === totalPages) {
                start = totalPages - 2;
            }
        } else {
            // For less than 3 total pages, just show all available pages
            start = 1;
            end = totalPages;
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };


    // Dummy categories for sidebar
    const categories = [
        { name: "Adventure", count: 3 },
        { name: "Tips & Guides", count: 4 },
        { name: "Sustainable Travel", count: 2 },
        { name: "Food & Culture", count: 2 },
        { name: "Photography", count: 1 },
    ];

    // Dummy recent posts for sidebar
    const recentPosts = [
        { title: "Best Time to Visit Japan", slug: "best-time-japan" },
        { title: "Packing Essentials for Europe", slug: "packing-europe" },
        { title: "Coastal Road Trips in Australia", slug: "coastal-australia" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800">

            {/* Hero Section */}
            <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden p-4 md:p-8">
                {/* Background Image/Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://blog.manufacturing.hexagon.com/wp-content/uploads/2019/05/Designing-Passengers-in-flight-experience-blog-hero.jpg')` }}
                >
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        Our Travel Blog
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl font-light opacity-90 tracking-wide">
                        Inspiration, Guides & Stories for Your Next Adventure
                    </p>
                </div>
            </section>

            {/* Blog Posts Grid and Sidebar */}
            <section className="py-16 md:py-24 bg-white rounded-t-3xl -mt-8 relative z-20 shadow-2xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Main Blog Posts Area */}
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center">
                            <Newspaper size={36} className="text-indigo-600 mr-3" /> Latest Articles
                        </h2>
                        {currentPosts.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {currentPosts.map((post) => (
                                    <BlogPostCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 py-10">
                                <p className="text-xl">No blog posts found for this page.</p>
                                <p className="mt-2">Try going back to the first page or adjusting your filters.</p>
                            </div>
                        )}


                        {/* Pagination */}
                        {totalPages > 1 && ( // Only show pagination if there's more than one page
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {/* Render page numbers */}
                                    {getPaginationGroup().map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToPage(item)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                currentPage === item
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-10">
                        {/* Search Bar */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Search size={24} className="text-indigo-500 mr-2" /> Search
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full sm:flex-grow px-4 py-2 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-0"
                                />
                                <button
                                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-indigo-700 transition-colors"
                                >
                                    <Search size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Tag size={24} className="text-green-500 mr-2" /> Categories
                            </h3>
                            <ul>
                                {categories.map((cat, index) => (
                                    <li key={index} className="mb-2">
                                        <Link to={`/blog/category/${cat.name.toLowerCase().replace(/\s/g, '-')}`} className="flex justify-between items-center text-gray-700 hover:text-indigo-600 transition-colors py-1">
                                            <span>{cat.name}</span>
                                            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Recent Posts */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <Calendar size={24} className="text-orange-500 mr-2" /> Recent Posts
                            </h3>
                            <ul>
                                {recentPosts.map((post, index) => (
                                    <li key={index} className="mb-3">
                                        <Link to={`/blog/${post.slug}`} className="block text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                                            <ChevronRight size={16} className="inline-block mr-1 text-gray-500" /> {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <Mail size={24} className="mr-2" /> Newsletter
                            </h3>
                            <p className="text-sm opacity-90 mb-4">
                                Subscribe to our newsletter for the latest travel tips and exclusive deals.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="w-full sm:flex-grow px-4 py-2 border border-transparent rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none text-gray-800"
                                />
                                <button
                                    className="w-full sm:w-auto px-4 py-2 bg-white text-indigo-700 rounded-lg sm:rounded-r-lg sm:rounded-l-none font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Call to Action at the bottom */}
            <section className="py-16 md:py-24 bg-indigo-600 text-white text-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                        Find the perfect flight or hotel for your next adventure with VoyageEase.
                    </p>
                    <Link
                        to="/flights"
                        className="inline-flex items-center bg-white text-indigo-700 hover:bg-gray-100 font-semibold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 group"
                    >
                        Book Now <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Reusable Blog Post Card Component (remains unchanged)
const BlogPostCard = ({ post }) => (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 animate-fade-in">
        <div className="relative h-48 w-full overflow-hidden">
            <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/d1d5db/333333?text=Blog+Image" }}
            />
            {post.category && (
                <span className="absolute bottom-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {post.category}
                </span>
            )}
        </div>
        <div className="p-6 flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">
                <Link to={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors">{post.title}</Link>
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <UserCircle size={16} className="mr-1" /> {post.author}
                <span className="mx-2">|</span>
                <Calendar size={16} className="mr-1" /> {post.date}
            </div>
            <p className="text-gray-700 mb-5 text-base leading-relaxed">
                {post.excerpt}
            </p>
            <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors group"
            >
                Read More <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    </div>
);

export default Blog;