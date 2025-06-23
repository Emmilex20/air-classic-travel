import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    UserCircle,
    Tag,
    MessageSquare,
    Star,
    Send,
    ThumbsUp,
    ThumbsDown,
    Share2,
    Bookmark,
    Eye,
    Globe,
    BookOpen,
    ArrowRight,
    Mail // Don't forget to import Mail for the newsletter section
} from 'lucide-react';

function BlogPostDetail() {
    const blogPosts = useMemo(() => [
        {
            id: 1,
            title: "Exploring the Hidden Gems of Southeast Asia",
            excerpt: "From ancient temples shrouded in mist to bustling night markets, Southeast Asia offers an unparalleled adventure. Discover secret beaches, vibrant cultures, and culinary delights that will captivate your senses.",
            // Original Image URL
            image: "https://flipflopdaily.com/wp-content/uploads/2024/09/Square_Sep18_Exploring-Hidden-Gems-in-Southeast-Asia-ezgif.com-optijpeg.jpg",
            author: "Travel Enthusiast",
            authorBio: "Alice is a seasoned travel writer with a passion for uncovering hidden gems and sharing authentic travel experiences. She believes the best stories are found off the beaten path.",
            authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
            date: "June 20, 2024",
            slug: "hidden-gems-southeast-asia",
            category: "Adventure",
            tags: ["Southeast Asia", "Hidden Gems", "Culture", "Adventure", "Laos", "Indonesia", "Myanmar", "Vietnam"],
            views: 2130,
            readTime: "7 min read",
            content: `
                <p>Southeast Asia is a region of breathtaking beauty, rich history, and vibrant cultures. Beyond the well-trodden paths of Bangkok and Bali, there are countless hidden gems waiting to be explored. Imagine wandering through ancient ruins shrouded in mist in Myanmar, or discovering secluded beaches with crystal-clear waters in the Philippines that feel like your own private paradise.</p>

                <h3>Discovering Local Life in Laos</h3>
                <p>In Laos, the slow pace of life along the Mekong River offers a profound sense of tranquility. Luang Prabang, a UNESCO World Heritage site, is known for its serene temples and the morning alms-giving ceremony, a truly spiritual experience. Venture further to the remote villages, and you'll find a genuine warmth among the locals, unhurried routines, and stunning natural landscapes like the Kuang Si Falls.</p>

                <h3>Unspoiled Islands of Indonesia (Beyond Bali)</h3>
                <p>While Bali is a perennial favorite, Indonesia boasts thousands of islands, many of them untouched by mass tourism. Consider a trip to the Nusa Islands near Bali for dramatic cliffs and pristine waters, or embark on a multi-day boat trip to Komodo National Park to encounter the formidable Komodo dragons and snorkel in vibrant coral reefs. Raja Ampat, though harder to reach, offers some of the world's best diving and an unparalleled sense of remote paradise.</p>

                <h3>The Ancient Wonders of Bagan, Myanmar</h3>
                <p>Myanmar, still opening up to tourism, holds the mystical plains of Bagan, dotted with thousands of ancient temples and stupas. Watching the sunrise over this landscape from a hot air balloon is an unforgettable spectacle. The country's rich Buddhist heritage and the genuine kindness of its people make it a truly immersive cultural experience.</p>

                <h3>Culinary Journeys Through Vietnam's Central Coast</h3>
                <p>Vietnam's food scene is legendary, but the central coast, encompassing cities like Hue and Hoi An, offers a unique culinary journey. Hue, the former imperial capital, is famous for its refined royal cuisine, while Hoi An's charming ancient town is a foodie heaven with dishes like Cao Lau and White Rose dumplings. Take a cooking class to truly appreciate the intricate flavors and fresh ingredients.</p>

                <p>Embrace the unexpected, connect with locals, and allow yourself to get lost in the magic of Southeast Asia's lesser-known wonders. These experiences will undoubtedly be the most memorable parts of your journey.</p>
            `,
        },
        {
            id: 2,
            title: "Your First Solo Trip: A Guide to Confidence and Safety",
            excerpt: "Embarking on a solo journey can be transformative. This guide covers essential tips for planning, staying safe, managing your budget, and embracing the freedom of traveling alone.",
            // Original Image URL
            image: "https://www.solosophie.com/wp-content/uploads/2018/05/Planning-your-first-solo-trip.jpg",
            author: "Solo Explorer",
            authorBio: "Alex has journeyed through over 50 countries solo, empowering others to embrace the freedom and growth that comes with independent travel.",
            authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
            date: "June 15, 2024",
            slug: "first-solo-trip-guide",
            category: "Tips & Guides",
            tags: ["Solo Travel", "Safety Tips", "Budget Travel", "Confidence", "Planning"],
            views: 1890,
            readTime: "9 min read",
            content: `
                <p>The idea of a solo trip can be exhilarating and daunting all at once. It's a journey of self-discovery, pushing your boundaries, and learning to rely on your own strength. With careful planning and a confident mindset, your first solo adventure can be one of the most rewarding experiences of your life.</p>

                <h3>Choosing Your Destination Wisely</h3>
                <p>For your first solo trip, pick a destination known for its safety and welcoming atmosphere. Countries in Western Europe, like Iceland, Ireland, or New Zealand, are often recommended for their low crime rates and good infrastructure. Consider places where you feel comfortable with the language or where English is widely spoken.</p>

                <h3>Pre-Trip Planning Essentials</h3>
                <ul>
                    <li><strong>Research, Research, Research:</strong> Familiarize yourself with local customs, public transport, and safe neighborhoods. Read blogs from other solo travelers.</li>
                    <li><strong>Accommodation:</strong> Opt for reputable hotels, well-reviewed hostels (with female-only dorms if preferred), or trusted Airbnb hosts. Check for good security measures.</li>
                    <li><strong>Itinerary Flexibility:</strong> Have a general plan, but don't over-schedule. Solo travel is about spontaneity and adapting to new opportunities.</li>
                    <li><strong>Travel Insurance:</strong> This is non-negotiable. Ensure it covers medical emergencies, trip cancellations, and lost luggage.</li>
                    <li><strong>Copies of Documents:</strong> Keep digital and physical copies of your passport, visa, flight tickets, and hotel reservations separate from the originals.</li>
                </ul>

                <h3>Safety On The Go</h3>
                <p>Awareness is your best friend. Always let someone know your plans. Avoid walking alone at night in unfamiliar areas. Be cautious about sharing too much personal information with strangers. Trust your gut feeling – if a situation feels off, remove yourself from it. Use reputable transport and avoid flashy displays of wealth.</p>

                <h3>Managing Your Finances</h3>
                <p>Have multiple ways to access money (e.g., credit card, debit card, some local currency). Inform your bank of your travel dates to avoid card freezes. Keep emergency cash in different spots.</p>

                <h3>Embracing the Solo Experience</h3>
                <p>Don't be afraid to dine alone; bring a book or journal. Engage with locals and other travelers (in safe, public settings). Take moments for self-reflection. Remember, overcoming challenges on your own builds immense confidence. Enjoy the freedom to follow your own whims and create an adventure that's uniquely yours.</p>
            `,
        },
        {
            id: 3,
            title: "Top 5 Eco-Friendly Destinations for Sustainable Travel",
            excerpt: "Travel responsibly and explore destinations that prioritize environmental conservation and local community well-being. Learn about sustainable practices and how you can contribute.",
            // Original Image URL
            image: "https://d1ss4nmhr4m5he.cloudfront.net/wp-content/uploads/2023/12/04080730/Top-5-Sustainable-Travel-Options-That-Every-Business-Traveler-Should-Know-min-1024x538-1.jpg",
            author: "Green Traveler",
            authorBio: "An advocate for responsible tourism, Eco Wanderer provides insights and guides on minimizing environmental impact while exploring the world.",
            authorImage: "https://randomuser.me/api/portraits/men/45.jpg",
            date: "June 10, 2024",
            slug: "eco-friendly-destinations",
            category: "Sustainable Travel",
            tags: ["Eco-friendly", "Sustainable", "Green Travel", "Conservation", "Ecotourism"],
            views: 1500,
            readTime: "8 min read",
            content: `
                <p>As travelers, we have a responsibility to protect the planet and support the communities we visit. Sustainable travel isn't just a trend; it's a mindful approach to exploring the world that ensures these incredible places remain vibrant for future generations. Here are five destinations leading the way in eco-tourism.</p>

                <h3>1. Costa Rica: Pioneer of Ecotourism</h3>
                <p>Costa Rica has long been a global leader in environmental conservation, with over 25% of its land protected in national parks and reserves. Its commitment to renewable energy sources and a rich biodiversity make it a prime example of sustainable tourism. Visitors can enjoy thrilling zip-lining, explore cloud forests, and volunteer in conservation projects, all while supporting local eco-lodges.</p>

                <h3>2. Palau: A Pristine Ocean Sanctuary</h3>
                <p>This archipelago in Micronesia is renowned for its vibrant marine life and innovative conservation efforts, including the Palau Pledge, a mandatory visa requirement that asks visitors to commit to responsible tourism. Dive into its pristine waters, explore jellyfish lakes, and witness firsthand a nation deeply committed to preserving its natural wonders.</p>

                <h3>3. Slovenia: Europe's Green Heart</h3>
                <p>Slovenia, a small country nestled in Central Europe, is a gem for sustainable travel. It boasts incredible natural beauty, from the Julian Alps to the Adriatic coast, and has a strong focus on green infrastructure and sustainable transport. Ljubljana, its capital, was even awarded the European Green Capital title. Enjoy cycling, hiking, and exploring its charming towns and lush landscapes.</p>

                <h3>4. Norway: Fjords and Green Energy</h3>
                <p>Norway's breathtaking fjords, majestic mountains, and commitment to renewable energy make it an exceptional sustainable destination. The country encourages visitors to explore its natural wonders responsibly, with many eco-certified tours and accommodations. Its stunning scenery and dedication to preserving its natural heritage offer a truly green adventure.</p>

                <h3>5. Finland: Land of a Thousand Lakes and Forest Retreats</h3>
                <p>With vast expanses of wilderness, clean air, and a strong emphasis on connection with nature, Finland is ideal for eco-conscious travelers. Experience the tranquility of its national parks, go foraging for berries, or stay in unique eco-friendly accommodations like glass igloos. The Finns' respect for nature is deeply ingrained in their culture.</p>

                <p>By choosing these destinations and adopting sustainable practices, you can enjoy incredible travel experiences while making a positive impact on the planet.</p>
            `,
        },
        {
            id: 4,
            title: "Budget Travel Hacks: See the World Without Breaking the Bank",
            excerpt: "Traveling on a budget doesn't mean sacrificing adventure. Discover smart strategies for saving on flights, accommodation, food, and activities to make your travel dreams a reality.",
            // Original Image URL
            image: "https://surffares.com/travelguru/wp-content/uploads/2023/12/Budget-Travel-Hacks-to-Save-Your-Money-blog.jpg",
            author: "Frugal Wanderer",
            authorBio: "The Wanderlust Warrior is a master of mindful spending, proving that epic adventures don't have to break the bank.",
            authorImage: "https://randomuser.me/api/portraits/men/67.jpg",
            date: "June 05, 2024",
            slug: "budget-travel-hacks",
            category: "Tips & Guides",
            tags: ["Budget", "Travel Tips", "Saving Money", "Flights", "Accommodation"],
            views: 2500,
            readTime: "10 min read",
            content: `
                <p>Dreaming of seeing the world but worried about the cost? Fear not! Budget travel is entirely possible with a few clever hacks. It's about being resourceful, flexible, and embracing local experiences that often come with a lower price tag.</p>

                <h3>Flights: Be Flexible and Smart</h3>
                <ul>
                    <li><strong>Flex Your Dates:</strong> Use flight comparison sites with flexible date options (e.g., Google Flights' calendar view) to find the cheapest days to fly. Mid-week flights are often cheaper.</li>
                    <li><strong>Fly into Smaller Airports:</strong> Sometimes flying into a secondary airport near your destination can save you a significant amount, even with ground transport costs.</li>
                    <li><strong>Set Price Alerts:</strong> Airlines and flight aggregators allow you to set alerts for price drops on your desired routes.</li>
                    <li><strong>Consider Layovers:</strong> Direct flights are convenient, but flights with longer layovers are often considerably cheaper. Use the layover to explore a new city!</li>
                </ul>

                <h3>Accommodation: Beyond Hotels</h3>
                <ul>
                    <li><strong>Hostels:</strong> Ideal for solo travelers and those looking to meet new people. Many offer private rooms too.</li>
                    <li><strong>Guesthouses & B&Bs:</strong> Often more affordable and offer a more local experience than large hotels.</li>
                    <li><strong>House Sitting/Exchange:</strong> If you're comfortable, house sitting can provide free accommodation in exchange for looking after a home or pets.</li>
                    <li><strong>Camping:</strong> For nature lovers, camping or glamping can be a very budget-friendly option.</li>
                </ul>

                <h3>Food: Eat Like a Local</h3>
                <p>Food can be a major expense, but it's also a fantastic way to experience local culture. Avoid tourist traps and:<p>
                <ul>
                    <li><strong>Eat Street Food:</strong> Often delicious, authentic, and incredibly cheap.</li>
                    <li><strong>Visit Local Markets:</strong> Buy fresh produce and cook your own meals if your accommodation has a kitchen.</li>
                    <li><strong>Look for Lunch Deals:</strong> Many restaurants offer cheaper lunch menus than dinner.</li>
                    <li><strong>Pack Snacks:</strong> Prevent impulse purchases by carrying your own snacks.</li>
                </ul>

                <h3>Activities & Transport: Savvy Savings</h3>
                <ul>
                    <li><strong>Free Walking Tours:</strong> A great way to get acquainted with a city and learn its history (tip your guide!).</li>
                    <li><strong>Public Transport:</strong> Embrace local buses, trains, and subways. They're often efficient and much cheaper than taxis.</li>
                    <li><strong>Look for Free Attractions:</strong> Many cities offer free museums, parks, or viewpoints.</li>
                    <li><strong>Travel Off-Season/Shoulder Season:</strong> Prices for flights and accommodation are significantly lower, and attractions are less crowded.</li>
                </ul>

                <p>Budget travel requires a bit more planning and flexibility, but the rewards are immense. You'll gain a deeper understanding of local life, meet fascinating people, and realize that incredible adventures don't require a hefty bank account.</p>
            `,
        },
        {
            id: 5,
            title: "The Ultimate Foodie Tour: A Culinary Journey Through Italy",
            excerpt: "Indulge in the rich flavors of Italy, from authentic pasta in Rome to fresh seafood on the Amalfi Coast. This guide takes you through the must-try dishes and best eateries.",
            // Original Image URL
            image: "https://i.ytimg.com/vi/haUKaPAJRRo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCAXQWoEfJZa_1XG7EUQs_8uO8XQA",
            author: "Gourmet Traveler",
            authorBio: "Chef Traveler blends culinary expertise with wanderlust, exploring global cuisines and sharing the stories behind every dish.",
            authorImage: "https://randomuser.me/api/portraits/men/78.jpg",
            date: "May 30, 2024",
            slug: "foodie-tour-italy",
            category: "Food & Culture",
            tags: ["Italy", "Food", "Culinary", "Pasta", "Pizza", "Gelato"],
            views: 3100,
            readTime: "11 min read",
            content: `
                <p>Italy is not just a country; it's a culinary philosophy. Every region, every city, and often every family has its own specialties and traditions. Embarking on a foodie tour through Italy is an experience that delights all senses, from the bustling markets to the cozy trattorias.</p>

                <h3>Rome: Classics and Carbonara</h3>
                <p>Begin your epicurean adventure in the Eternal City. Rome is the birthplace of iconic pasta dishes like Cacio e Pepe, Amatriciana, Carbonara, and Gricia. Seek out traditional *trattorias* in neighborhoods like Trastevere or Testaccio. Don't miss *supplì* (fried rice balls) and a classic *pizza al taglio* (pizza by the slice).</p>

                <h3>Naples: The Home of Pizza</h3>
                <p>No foodie tour of Italy is complete without a pilgrimage to Naples, the undisputed home of pizza. Insist on a *pizza Napoletana* from an authentic pizzeria, characterized by its soft, chewy crust and simple, high-quality ingredients like San Marzano tomatoes and mozzarella di bufala. It's a revelation!</p>

                <h3>Tuscany & Florence: Wine, Steak, and Gelato</h3>
                <p>Journey into the heart of Tuscany, where rolling hills are covered in vineyards and olive groves. In Florence, indulge in a perfectly cooked *Bistecca alla Fiorentina* (Florentine steak) paired with a robust Chianti Classico. For dessert, gelato is ubiquitous, but seek out artisanal shops for the best experience.</p>

                <h3>Emilia-Romagna: Italy's Food Valley</h3>
                <p>Often dubbed the "food valley" of Italy, Emilia-Romagna is a gastronomic powerhouse. This region is home to Parmigiano Reggiano cheese, Prosciutto di Parma, traditional balsamic vinegar from Modena, and delicious fresh pasta like *tagliatelle al ragù* (what many call Bolognese). Consider a food tour or visit local producers for tastings.</p>

                <h3>Amalfi Coast: Seafood by the Sea</h3>
                <p>Along the stunning Amalfi Coast, the cuisine shifts to focus on fresh seafood. Enjoy *spaghetti alle vongole* (clams), grilled fish, and sun-kissed lemons that produce the famous *limoncello*. The coastal towns offer breathtaking views to accompany your delectable meals.</p>

                <p>Remember to savor each moment, embrace the Italian way of eating (long lunches, late dinners), and let your taste buds guide your journey. Buon appetito!</p>
            `,
        },
        {
            id: 6,
            title: "Adventures in the Amazon: A Guide to Rainforest Exploration",
            excerpt: "Immerse yourself in the incredible biodiversity of the Amazon rainforest. Learn about ethical wildlife viewing, eco-lodges, and the unforgettable experiences awaiting you.",
            // Original Image URL
            image: "https://weareglobaltravellers.com/wp-content/uploads/2021/10/Wheres-Mollie-An-ecofriendly-guide-to-visiting-the-Amazon-11-760x507.jpg",
            author: "Nature Lover",
            authorBio: "Dr. Wild is an environmental scientist and nature photographer dedicated to educating others about rainforest conservation and ethical wildlife tourism.",
            authorImage: "https://randomuser.me/api/portraits/men/19.jpg",
            date: "May 25, 2024",
            slug: "adventures-amazon",
            category: "Adventure",
            tags: ["Amazon", "Rainforest", "Wildlife", "Ecotourism", "Conservation", "Brazil", "Peru"],
            views: 1950,
            readTime: "9 min read",
            content: `
                <p>The Amazon rainforest, the lungs of our planet, is an extraordinary realm of unparalleled biodiversity and natural wonders. A journey into its heart promises an adventure like no other, but it's essential to approach it with respect and an understanding of ethical travel practices.</p>

                <h3>Choosing an Ethical Eco-Lodge</h3>
                <p>Your choice of accommodation is crucial for a responsible Amazon adventure. Look for eco-lodges that are committed to sustainable practices, supporting local communities, and actively contributing to conservation efforts. These lodges often employ local guides, ensuring authentic experiences and direct benefits to the indigenous populations. Check reviews and certifications for their commitment to sustainability.</p>

                <h3>What to Expect: Activities and Wildlife</h3>
                <ul>
                    <li><strong>Guided Jungle Treks:</strong> Explore the dense forest on foot with experienced local guides who can point out camouflaged creatures, medicinal plants, and explain the ecosystem's intricacies. You might spot sloths, various monkey species, colorful birds, and fascinating insects.</li>
                    <li><strong>River Expeditions:</strong> Navigate the winding waterways by canoe or small boat. This is often the best way to see caimans, anacondas, pink river dolphins, and a vast array of birdlife along the riverbanks.</li>
                    <li><strong>Night Walks/Safaris:</strong> The Amazon comes alive at night. A guided nocturnal walk reveals a different world, with fascinating insects, amphibians, and nocturnal mammals.</li>
                    <li><strong>Community Visits:</strong> Many eco-lodges offer opportunities to visit indigenous communities, learn about their traditions, handicrafts, and way of life. Ensure these visits are respectful and genuinely benefit the community.</li>
                </ul>

                <h3>Packing Essentials for the Rainforest</h3>
                <p>Pack light, quick-drying clothing (long sleeves and pants to protect against insects), a wide-brimmed hat, sturdy waterproof hiking boots, biodegradable insect repellent, high-SPF sunscreen, a reusable water bottle, a good quality camera with zoom lens, binoculars, and a headlamp or flashlight. A lightweight rain poncho is also essential!</p>

                <h3>Responsible Wildlife Viewing</h3>
                <p>Always observe animals from a respectful distance. Never feed or attempt to touch wildlife. Avoid any tours that involve handling or exploiting animals for tourist photos. Support genuine conservation efforts and local guides who prioritize the well-being of the ecosystem.</p>

                <p>An Amazon adventure is not just a trip; it's an immersive educational experience that fosters a deeper appreciation for nature and the vital role the rainforest plays in global health. Prepare to be amazed!</p>
            `,
        },
        {
            id: 7,
            title: "Winter Wonderland: Skiing in the Alps",
            excerpt: "Experience the thrill of skiing in the majestic Alps. This guide covers the best resorts, tips for beginners, and breathtaking views.",
            // Original Image URL
            image: "https://www.thetrainline.com/cms/media/7627/femaleskieralps-609059786.jpg?mode=crop&width=1080&height=1080&quality=70",
            author: "Snow Enthusiast",
            authorBio: "A lifelong skier and mountaineer, Peak Performer shares expert advice on conquering the world's most impressive peaks and slopes safely.",
            authorImage: "https://randomuser.me/api/portraits/women/62.jpg",
            date: "May 20, 2024",
            slug: "skiing-alps",
            category: "Adventure",
            tags: ["Skiing", "Alps", "Winter Sports", "Snow", "Adventure", "Europe"],
            views: 1700,
            readTime: "8 min read",
            content: `
                <p>The Alps, a mountain range spanning across eight European countries, offer some of the most spectacular skiing and snowboarding experiences in the world. From charming, traditional villages to bustling, modern resorts, there's a slope for every level of enthusiast. Prepare for breathtaking views, pristine snow, and an unforgettable winter escape.</p>

                <h3>Choosing Your Alpine Destination</h3>
                <ul>
                    <li><strong>For Beginners & Families:</strong> Resorts like Les Gets (France) or Saalbach-Hinterglemm (Austria) offer excellent ski schools, gentle slopes, and family-friendly amenities.</li>
                    <li><strong>For Experts & Off-Piste:</strong> Chamonix (France), Verbier (Switzerland), and St. Anton (Austria) are renowned for their challenging runs, extensive off-piste opportunities, and vibrant après-ski scenes.</li>
                    <li><strong>Luxury & Glamour:</strong> Zermatt (Switzerland), Courchevel (France), and Kitzbühel (Austria) combine world-class skiing with high-end dining, boutiques, and luxurious accommodations.</li>
                </ul>

                <h3>Essential Skiing Tips</h3>
                <ul>
                    <li><strong>Lessons Are Key:</strong> Even if you're a quick learner, a few lessons with a certified instructor can drastically improve your technique and confidence.</li>
                    <li><strong>Dress in Layers:</strong> Mountain weather can change quickly. Layering allows you to adjust to temperature fluctuations. Waterproof outer layers are crucial.</li>
                    <li><strong>Protect Your Skin and Eyes:</strong> High-altitude sun is intense. Use high-SPF sunscreen and wear good quality ski goggles or sunglasses.</li>
                    <li><strong>Stay Hydrated:</strong> Physical exertion at altitude requires plenty of water.</li>
                    <li><strong>Know the Code:</strong> Familiarize yourself with the FIS (International Ski Federation) Rules of Conduct to ensure safety on the slopes.</li>
                </ul>

                <h3>Beyond the Slopes</h3>
                <p>Alpine resorts offer more than just skiing. Enjoy:<p>
                <ul>
                    <li><strong>Après-Ski:</strong> Wind down with drinks, music, and dancing.</li>
                    <li><strong>Snowshoeing & Winter Hiking:</strong> Explore the serene winter landscapes at a slower pace.</li>
                    <li><strong>Ice Skating & Tobogganing:</strong> Fun activities for all ages.</li>
                    <li><strong>Local Cuisine:</strong> Indulge in hearty Alpine dishes like fondue, raclette, and goulash.</li>
                </ul>

                <p>The magic of the Alps in winter extends far beyond the thrill of the descent. It's about crisp mountain air, stunning vistas, cozy chalets, and the camaraderie of fellow snow enthusiasts. Get ready for an exhilarating adventure!</p>
            `,
        },
        {
            id: 8,
            title: "Cultural Immersion in Kyoto, Japan",
            excerpt: "Discover the ancient traditions and serene beauty of Kyoto. From historic temples to tranquil gardens, immerse yourself in Japanese culture.",
            // Original Image URL
            image: "https://pelorus-statamic.s3.eu-west-2.amazonaws.com/images/geisha-street.jpg",
            author: "Culture Seeker",
            authorBio: "Cultural Connector specializes in immersive cultural travel, bridging gaps between travelers and local traditions worldwide.",
            authorImage: "https://randomuser.me/api/portraits/women/90.jpg",
            date: "May 18, 2024",
            slug: "kyoto-cultural-immersion",
            category: "Food & Culture",
            tags: ["Japan", "Kyoto", "Culture", "Temples", "Gardens", "Tradition"],
            views: 2800,
            readTime: "10 min read",
            content: `
                <p>Kyoto, Japan's ancient capital, is a city where time seems to slow down, allowing you to immerse yourself in centuries of tradition, stunning architecture, and serene landscapes. It's a place where geishas still walk the cobbled streets and the echoes of samurais resonate through its historic temples. A journey to Kyoto is a journey into the soul of Japan.</p>

                <h3>Iconic Temples and Shrines</h3>
                <ul>
                    <li><strong>Kinkaku-ji (Golden Pavilion):</strong> A magnificent Zen temple covered in gold leaf, reflecting beautifully in its pond.</li>
                    <li><strong>Fushimi Inari-taisha:</strong> Famous for its thousands of vibrant orange torii gates winding up a sacred mountain.</li>
                    <li><strong>Kiyomizu-dera:</strong> A wooden temple perched on a hillside, offering panoramic views of the city, especially stunning during cherry blossom and autumn leaf seasons.</li>
                    <li><strong>Ryoan-ji:</strong> Home to Japan's most famous rock garden, a minimalist masterpiece designed for contemplation.</li>
                </ul>

                <h3>Serene Gardens and Nature</h3>
                <p>Kyoto is dotted with exquisite gardens that embody Japanese aesthetics. Explore the Arashiyama Bamboo Grove, particularly enchanting in the early morning light. Stroll through the tranquil moss gardens or visit the Imperial Palace Gardens for a glimpse into imperial life.</p>

                <h3>Traditional Arts and Experiences</h3>
                <ul>
                    <li><strong>Gion District:</strong> Wander through this historic geisha district in the evening, hoping to catch a glimpse of a geiko (Kyoto geisha) or maiko (apprentice geisha).</li>
                    <li><strong>Tea Ceremony:</strong> Participate in a traditional Japanese tea ceremony, a profound experience that emphasizes harmony, respect, purity, and tranquility.</li>
                    <li><strong>Kimono Rental:</strong> Enhance your cultural immersion by renting a traditional kimono and walking through the historic streets.</li>
                    <li><strong>Zen Meditation:</strong> Many temples offer introductory sessions to Zen meditation, providing a peaceful escape from the bustling city.</li>
                </ul>

                <h3>Culinary Delights</h3>
                <p>Kyoto offers a refined culinary scene. Indulge in exquisite *Kaiseki* (traditional multi-course dinner), try local specialties like *yuba* (tofu skin), and savor the delicate flavors of Kyoto-style sushi. Don't forget to visit Nishiki Market, known as "Kyoto's Kitchen," for a vibrant sensory experience.</p>

                <p>Kyoto is a city that invites you to slow down, reflect, and appreciate the profound beauty of Japanese culture. Each corner turned reveals another layer of history and serenity, leaving an indelible mark on your soul.</p>
            `,
        },
        {
            id: 9,
            title: "Photography Tips for Stunning Travel Photos",
            excerpt: "Learn how to capture breathtaking travel moments. This guide covers composition, lighting, and editing techniques for stunning photos.",
            // Original Image URL
            image: "https://expertvagabond.com/wp-content/uploads/travel-photography-tips-guide-1.jpg",
            author: "Photo Pro",
            authorBio: "Lens & Compass is a professional travel photographer who teaches aspiring shutterbugs how to capture the world's beauty through their lens.",
            authorImage: "https://randomuser.me/api/portraits/men/22.jpg",
            date: "May 12, 2024",
            slug: "travel-photography-tips",
            category: "Photography",
            tags: ["Photography", "Travel Photography", "Tips", "Composition", "Editing", "Gear"],
            views: 2300,
            readTime: "9 min read",
            content: `
                <p>Travel photography is about more than just pointing and shooting; it's about capturing the essence of a place, its people, and its spirit. With a few key techniques, you can transform your vacation snapshots into breathtaking visual stories.</p>

                <h3>1. Master the Golden Hour</h3>
                <p>The "golden hour," the period shortly after sunrise or before sunset, offers the most magical light for photography. The soft, warm, diffused light creates long, dramatic shadows and enhances colors, making landscapes and portraits truly glow.</p>

                <h3>2. Embrace Composition Rules (and Break Them)</h3>
                <ul>
                    <li><strong>Rule of Thirds:</strong> Imagine your frame divided into nine equal sections by two horizontal and two vertical lines. Place your main subject at one of the intersections for a more balanced and engaging composition.</li>
                    <li><strong>Leading Lines:</strong> Use natural or architectural lines (roads, fences, rivers) to draw the viewer's eye towards your subject or a focal point.</li>
                    <li><strong>Framing:</strong> Use natural frames (archways, tree branches, windows) to create depth and focus attention on your subject.</li>
                    <li><strong>Symmetry & Patterns:</strong> Look for natural or man-made symmetries and repeating patterns to create visually compelling images.</li>
                </ul>

                <h3>3. Experiment with Perspective</h3>
                <p>Don't just shoot from eye level. Get down low, climb high, or shoot through objects to find unique perspectives. This can turn an ordinary scene into an extraordinary one.</p>

                <h3>4. Focus on Storytelling</h3>
                <p>Every photo should tell a story. Instead of just documenting a landmark, try to capture the interaction of people with the place, local traditions, or the small details that reveal the character of your destination.</p>

                <h3>5. Patience is a Virtue</h3>
                <p>Great photos rarely happen in a rush. Wait for the right light, the perfect moment, or for people to move into the ideal position. Observe your surroundings and be ready when the magic happens.</p>

                <h3>6. Learn Basic Editing</h3>
                <p>Post-processing is where good photos become great. Learn to adjust exposure, contrast, white balance, and crop effectively using free tools or professional software. Don't over-edit; aim for natural enhancements.</p>

                <h3>7. Back Up Your Photos!</h3>
                <p>Always back up your photos regularly, ideally to a cloud service and an external hard drive. The worst feeling is losing precious travel memories.</p>

                <p>With practice and these tips, you'll soon be capturing stunning travel photos that truly reflect the beauty and adventure of your journeys.</p>
            `,
        },
        {
            id: 10,
            title: "Sustainable Backpacking: Leave No Trace",
            excerpt: "Learn how to minimize your environmental impact while backpacking. Tips on eco-friendly gear, waste management, and responsible hiking.",
            // Original Image URL
            image: "https://www.backpacker.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cc_faces:auto%2Cq_auto:good%2Cw_620/MTg5MTgwODQxOTg2OTE0MzY4/i-hiked-200-miles-in-cheap-costco-hiking-shoes-and-my-feet-are-doing-fine-hero.jpg",
            author: "Eco Hiker",
            authorBio: "Trail Guardian is an experienced backpacker and environmental educator, committed to promoting responsible outdoor recreation and preserving wild spaces.",
            authorImage: "https://randomuser.me/api/portraits/men/55.jpg",
            date: "May 08, 2024",
            slug: "sustainable-backpacking",
            category: "Sustainable Travel",
            tags: ["Backpacking", "Leave No Trace", "Hiking", "Eco-friendly", "Outdoor Ethics", "Wilderness"],
            views: 1650,
            readTime: "12 min read",
            content: `
                <p>Backpacking offers an unparalleled connection with nature, but with great adventure comes great responsibility. Sustainable backpacking is rooted in the "Leave No Trace" principles, a set of outdoor ethics that minimize human impact on the environment. By following these guidelines, you can ensure that the wild places we love remain pristine for generations to come.</p>

                <h3>The Seven Principles of Leave No Trace:</h3>
                <ul>
                    <li><strong>1. Plan Ahead and Prepare:</strong>
                        <p>Research your destination's regulations and potential hazards. Pack appropriately to minimize waste and avoid the need for fires. Know the weather, and carry maps and a compass/GPS.</p>
                    </li>
                    <li><strong>2. Travel and Camp on Durable Surfaces:</strong>
                        <p>Stick to marked trails, even if muddy, to prevent widening. Camp on established sites at least 200 feet from water sources. Avoid sensitive areas like meadows and fragile vegetation.</p>
                    </li>
                    <li><strong>3. Dispose of Waste Properly:</strong>
                        <p>Pack out everything you pack in, including all trash, food scraps, and even human waste (where facilities aren't available, learn how to bury it properly). Leave no litter behind.</p>
                    </li>
                    <li><strong>4. Leave What You Find:</strong>
                        <p>Resist the urge to take natural objects like rocks, plants, or historical artifacts. Allow others to discover and enjoy the natural wonders as you did.</p>
                    </li>
                    <li><strong>5. Minimize Campfire Impacts:</strong>
                        <p>Use established fire rings. Keep fires small and burn all wood and coals to ash. Never leave a fire unattended, and ensure it's completely out and cold before leaving.</p>
                    </li>
                    <li><strong>6. Respect Wildlife:</strong>
                        <p>Observe animals from a distance. Never feed wildlife, as it can harm their health and alter their natural behaviors. Store food securely to prevent attracting animals.</p>
                    </li>
                    <li><strong>7. Be Considerate of Other Visitors:</strong>
                        <p>Respect the tranquility of nature. Keep noise levels down. Yield to other users on trails. Allow others to enjoy the experience without disturbance.</p>
                    </li>
                </ul>

                <h3>Eco-Friendly Gear & Practices:</h3>
                <ul>
                    <li><strong>Reusable Items:</strong> Carry a reusable water bottle, coffee cup, and cutlery to reduce single-use plastic.</li>
                    <li><strong>Biodegradable Products:</strong> Use biodegradable soap and toiletries, and wash dishes away from water sources.</li>
                    <li><strong>Repair, Don't Replace:</strong> Extend the life of your gear through repairs rather than buying new.</li>
                    <li><strong>Support Local:</strong> Buy food and supplies from local businesses in gateway communities to support the local economy.</li>
                </ul>

                <p>By integrating these principles into your backpacking adventures, you become a steward of the wild, ensuring that the natural world remains beautiful and accessible for everyone.</p>
            `,
        },
    ], []); // Empty dependency array means it only runs once on mount

    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    // Filter out the current post for "Related Posts"
    const relatedPosts = useMemo(() => {
        return blogPosts
            .filter(p => p.slug !== slug && p.category === post?.category) // Suggest posts from the same category
            .sort(() => 0.5 - Math.random()) // Randomize related posts
            .slice(0, 3); // Get up to 3 related posts
    }, [blogPosts, slug, post]);

    // Dummy comments state
    const [comments, setComments] = useState([
        { id: 1, author: "Travel Lover", date: "June 22, 2024", text: "What a fantastic read! Southeast Asia is truly magical.", likes: 5, dislikes: 0 },
        { id: 2, author: "Adventure Seeker", date: "June 21, 2024", text: "Great tips, especially about budget travel. I'm planning my first solo trip!", likes: 12, dislikes: 1 },
    ]);
    const [newComment, setNewComment] = useState("");

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments([
                ...comments,
                {
                    id: comments.length + 1,
                    author: "You", // In a real app, this would be the logged-in user
                    date: new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }),
                    text: newComment.trim(),
                    likes: 0,
                    dislikes: 0,
                },
            ]);
            setNewComment("");
        }
    };

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
                    <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been moved.</p>
                    <Link to="/blog" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                {/* Back Button */}
                <Link
                    to="/blog"
                    className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition-colors mb-8 text-lg"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to All Posts
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    {/* Hero Image Section */}
                    <div className="relative h-96 w-full overflow-hidden">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover object-center transform transition-transform duration-500 hover:scale-105"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x500/d1d5db/333333?text=Blog+Image" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            {post.category && (
                                <span className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md mb-3 inline-block">
                                    {post.category}
                                </span>
                            )}
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center text-gray-200 text-base mt-3 gap-x-6 gap-y-2">
                                <span className="flex items-center">
                                    <UserCircle size={20} className="mr-2 text-gray-300" /> {post.author}
                                </span>
                                <span className="flex items-center">
                                    <Calendar size={20} className="mr-2 text-gray-300" /> {post.date}
                                </span>
                                {post.readTime && (
                                    <span className="flex items-center">
                                        <BookOpen size={20} className="mr-2 text-gray-300" /> {post.readTime}
                                    </span>
                                )}
                                {post.views && (
                                    <span className="flex items-center">
                                        <Eye size={20} className="mr-2 text-gray-300" /> {post.views.toLocaleString()} views
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 p-8 md:p-12">
                        {/* Article Content */}
                        <article className="lg:col-span-3">
                            <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed border-l-4 border-indigo-500 pl-4 italic">
                                {post.excerpt}
                            </p>
                            <div
                                className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Tags Section */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-10 pt-6 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <Tag size={24} className="text-purple-600 mr-2" /> Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag, index) => (
                                            <span key={index} className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1 space-y-10">
                            {/* Author Bio */}
                            {post.authorBio && (
                                <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 text-center animate-fade-in">
                                    <img
                                        src={post.authorImage || "https://randomuser.me/api/portraits/men/75.jpg"}
                                        alt={post.author}
                                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-300 shadow-md"
                                    />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">About {post.author}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {post.authorBio}
                                    </p>
                                    <Link to="#" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                                        View more by {post.author.split(' ')[0]} <ArrowRight size={14} className="inline-block ml-1" />
                                    </Link>
                                </div>
                            )}

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in-delay">
                                    <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                        <Star size={24} className="text-yellow-500 mr-2" /> Related Posts
                                    </h3>
                                    <ul className="space-y-4">
                                        {relatedPosts.map((relatedPost) => (
                                            <li key={relatedPost.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                                <Link to={`/blog/${relatedPost.slug}`} className="block group">
                                                    <h4 className="text-base font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight">
                                                        {relatedPost.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                                        <Calendar size={14} className="mr-1" /> {relatedPost.date}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Call to Action: Newsletter */}
                            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-xl shadow-lg animate-fade-in-delay-2">
                                <h3 className="text-xl font-bold mb-4 flex items-center">
                                    <Mail size={24} className="mr-2" /> Stay Updated!
                                </h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Don't miss out on our latest travel stories and tips. Subscribe to our newsletter!
                                </p>
                                <form className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        className="w-full px-4 py-2 border border-transparent rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-white text-indigo-700 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                                    >
                                        Subscribe Now
                                    </button>
                                </form>
                            </div>
                        </aside>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-gray-50 p-8 md:p-12 border-t border-gray-200">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                            <MessageSquare size={30} className="text-indigo-600 mr-3" /> Comments ({comments.length})
                        </h2>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="mb-10 p-6 bg-white rounded-lg shadow-md border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Leave a Comment</h3>
                            <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 resize-y min-h-[100px]"
                                placeholder="Share your thoughts..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            ></textarea>
                            <button
                                type="submit"
                                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg flex items-center"
                            >
                                Post Comment <Send size={18} className="ml-2" />
                            </button>
                        </form>

                        {/* Existing Comments */}
                        <div className="space-y-8">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-fade-in-up-stagger">
                                        <div className="flex items-center mb-3">
                                            <img
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} // Placeholder avatar
                                                alt={comment.author}
                                                className="w-10 h-10 rounded-full mr-3 border-2 border-indigo-200"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800">{comment.author}</p>
                                                <p className="text-sm text-gray-500">{comment.date}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed mb-4">{comment.text}</p>
                                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                            <button className="flex items-center hover:text-indigo-600 transition-colors">
                                                <ThumbsUp size={16} className="mr-1" /> {comment.likes}
                                            </button>
                                            <button className="flex items-center hover:text-red-500 transition-colors">
                                                <ThumbsDown size={16} className="mr-1" /> {comment.dislikes}
                                            </button>
                                            <button className="flex items-center hover:text-gray-700 transition-colors">
                                                <MessageSquare size={16} className="mr-1" /> Reply
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-600 italic">No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogPostDetail;