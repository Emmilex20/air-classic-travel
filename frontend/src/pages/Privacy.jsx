import React from 'react';
import { Link } from 'react-router-dom';
import {
    ShieldCheck, // Main icon for Privacy
    User, // For Data Collected (Personal Data)
    Laptop, // For Usage Data
    Cookie, // For Cookies
    Share2, // For Data Sharing
    Lock, // For Security
    FileText, // For Your Rights
    Megaphone, // For Policy Changes
    Mail, // For Contact
    ArrowLeft // For Back to Home
} from 'lucide-react';

function Privacy() {
    const privacyPolicyContent = {
        introduction: `
            <p>At <strong>VoyageEase</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our website and services.</p>
            <p>By accessing or using VoyageEase, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not use our services.</p>
        `,
        dataCollected: `
            <p>We collect various types of information to provide and improve our services to you:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>Personal Identification Information:</strong> Name, email address, phone number, passport details, date of birth, and gender, primarily collected during booking or account registration.</li>
                <li><strong>Payment Information:</strong> Credit/debit card numbers, billing address, and other payment details. This data is encrypted and processed securely by our payment partners.</li>
                <li><strong>Travel Information:</strong> Flight preferences, dietary restrictions, special assistance needs, and historical travel data to personalize your experience.</li>
                <li><strong>Contact Information:</strong> Data you provide when you contact our customer support, including records of communication.</li>
            </ul>
        `,
        usageData: `
            <p>We automatically collect information on how the service is accessed and used ("Usage Data"). This may include:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>Your computer's Internet Protocol address (e.g., IP address).</li>
                <li>Browser type and version.</li>
                <li>Pages of our Service that you visit, the time and date of your visit, the time spent on those pages.</li>
                <li>Unique device identifiers and other diagnostic data.</li>
            </ul>
            <p class="mt-2">This data helps us understand user behavior, improve website functionality, and enhance your browsing experience.</p>
        `,
        cookiesPolicy: `
            <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
            <p class="mt-2">Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.</p>
            <p class="mt-2">We use:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>Session Cookies:</strong> To operate our Service.</li>
                <li><strong>Preference Cookies:</strong> To remember your preferences and various settings.</li>
                <li><strong>Security Cookies:</strong> For security purposes.</li>
                <li><strong>Advertising Cookies:</strong> To serve you with advertisements that may be relevant to you and your interests.</li>
            </ul>
            <p class="mt-2">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
        `,
        howWeUseData: `
            <p>VoyageEase uses the collected data for various purposes, including:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>To provide and maintain our Service, including processing your bookings and payments.</li>
                <li>To notify you about changes to our Service.</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
                <li>To provide customer care and support.</li>
                <li>To provide analysis or valuable information so that we can improve the Service.</li>
                <li>To monitor the usage of the Service.</li>
                <li>To detect, prevent and address technical issues.</li>
                <li>To deliver personalized content and offers, including targeted advertising.</li>
            </ul>
        `,
        dataSharing: `
            <p>We may share your personal information with third parties in the following situations:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>Service Providers:</strong> With airlines, hotels, payment processors, and other third-party vendors necessary to fulfill your travel bookings.</li>
                <li><strong>Legal Requirements:</strong> When required by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
                <li><strong>Aggregated Data:</strong> We may share aggregated or anonymized data that cannot be used to identify you personally with partners for analytics or marketing.</li>
            </ul>
        `,
        dataSecurity: `
            <p>The security of your data is paramount to us. We implement a variety of security measures to maintain the safety of your personal information, including:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>Encryption:</strong> Data transmission is protected by SSL/TLS encryption.</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms are in place for internal data access.</li>
                <li><strong>Regular Audits:</strong> We regularly review our security practices to ensure compliance and identify vulnerabilities.</li>
                <li><strong>Data Minimization:</strong> We only collect and retain data that is necessary for the purposes outlined in this policy.</li>
            </ul>
            <p class="mt-2">However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
        `,
        yourRights: `
            <p>Depending on your location and applicable data protection laws (such as GDPR or CCPA), you may have the following rights regarding your personal data:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>The right to access:</strong> Request copies of your personal data.</li>
                <li><strong>The right to rectification:</strong> Request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                <li><strong>The right to erasure:</strong> Request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to restrict processing:</strong> Request that we restrict the processing of your personal data, under certain conditions.</li>
                <li><strong>The right to object to processing:</strong> Object to our processing of your personal data, under certain conditions.</li>
                <li><strong>The right to data portability:</strong> Request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>
            <p class="mt-2">To exercise any of these rights, please contact us using the details provided below.</p>
        `,
        policyChanges: `
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
            <p class="mt-2">We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
            <p class="mt-2">You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        `,
        contactUs: `
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>By email: <a href="mailto:privacy@voyageease.com" class="text-indigo-600 hover:underline">privacy@airclassictravel.com</a></li>
                <li>By visiting this page on our website: <a href="/contact" class="text-indigo-600 hover:underline">Air Classic Travel Contact Us</a></li>
            </ul>
        `
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center text-indigo-700 hover:text-indigo-900 font-semibold transition-colors mb-8 text-lg"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                    {/* Header Section */}
                    <div className="relative p-8 md:p-12 bg-gradient-to-r from-teal-600 to-blue-700 text-white text-center">
                        <ShieldCheck size={60} className="mx-auto mb-4 opacity-80 drop-shadow-md" />
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg mb-2">
                            Privacy Policy
                        </h1>
                        <p className="text-sm md:text-base opacity-90">
                            Last updated: June 23, 2025
                        </p>
                    </div>

                    {/* Policy Content Sections */}
                    <div className="p-8 md:p-12 space-y-12">
                        {/* Introduction */}
                        <section className="animate-fade-in-up-stagger">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={30} className="text-indigo-600 mr-3" /> Introduction
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.introduction }} />
                        </section>

                        {/* Data We Collect */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <User size={30} className="text-purple-600 mr-3" /> Information We Collect
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.dataCollected }} />
                        </section>

                        {/* Usage Data */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Laptop size={30} className="text-pink-600 mr-3" /> Usage Data
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.usageData }} />
                        </section>

                        {/* Cookies Policy */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Cookie size={30} className="text-orange-600 mr-3" /> Cookies and Tracking Technologies
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.cookiesPolicy }} />
                        </section>

                        {/* How We Use Your Data */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <ShieldCheck size={30} className="text-blue-600 mr-3" /> How We Use Your Data
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.howWeUseData }} />
                        </section>

                        {/* Data Sharing */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Share2 size={30} className="text-green-600 mr-3" /> Disclosure of Your Personal Data
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.dataSharing }} />
                        </section>

                        {/* Data Security */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Lock size={30} className="text-red-600 mr-3" /> Security of Your Data
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.dataSecurity }} />
                        </section>

                        {/* Your Data Protection Rights */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={30} className="text-cyan-600 mr-3" /> Your Data Protection Rights
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.yourRights }} />
                        </section>

                        {/* Changes to This Privacy Policy */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Megaphone size={30} className="text-lime-600 mr-3" /> Changes to This Privacy Policy
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.policyChanges }} />
                        </section>

                        {/* Contact Us */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Mail size={30} className="text-gray-600 mr-3" /> Contact Us
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: privacyPolicyContent.contactUs }} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Privacy;
