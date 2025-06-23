import React from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, // Main icon for Terms
    ScrollText, // For Acceptance
    Plane, // For Services
    UserCheck, // For User Accounts
    Lightbulb, // For Intellectual Property
    Ban, // For Prohibited Uses
    AlertTriangle, // For Disclaimers
    Scale, // For Governing Law
    Megaphone, // For Changes to Terms
    Mail, // For Contact Us
    ArrowLeft // For Back to Home
} from 'lucide-react';

function Terms() {
    const termsAndConditionsContent = {
        introduction: `
            <p>Welcome to <strong>Air Classic Travel</strong>! These Terms and Conditions ("Terms") govern your use of our website and services provided by VoyageEase ("we," "us," or "our").</p>
            <p class="mt-2">By accessing or using our services, you agree to be bound by these Terms, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
            <p class="mt-2">Please read these Terms carefully before using our services. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
        `,
        acceptance: `
            <p>By using Air Classic Travel, you affirm that you are at least 18 years old or the legal age of majority in your jurisdiction, and capable of entering into a binding agreement. You also acknowledge that you have read, understood, and agree to be bound by these Terms and our <a href="/privacy" class="text-indigo-600 hover:underline font-semibold">Privacy Policy</a>.</p>
            <p class="mt-2">If you are using the Service on behalf of an organization, you are agreeing to these Terms for that organization and warrant that you have the authority to bind that organization to these Terms. In that case, "you" and "your" will refer to that organization.</p>
        `,
        services: `
            <p>Air Classic Travel provides an online platform that allows users to search, compare, and book flights, hotels, car rentals, and other travel-related services from various third-party providers. We act as an intermediary and are not the direct provider of travel services.</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li><strong>Flight Bookings:</strong> We facilitate bookings with airlines. All bookings are subject to the airline's terms and conditions of carriage.</li>
                <li><strong>Hotel Reservations:</strong> We facilitate bookings with hotels and accommodation providers. Hotel-specific terms, including cancellation policies, apply.</li>
                <li><strong>Other Travel Services:</strong> This may include car rentals, travel insurance, and tour packages, each subject to the terms of the respective third-party provider.</li>
            </ul>
            <p class="mt-2">While we strive for accuracy, Air Classic Travel does not guarantee the availability, pricing, or quality of any third-party travel services. All prices are subject to change without notice until booking is confirmed.</p>
        `,
        userAccounts: `
            <p>To access certain features of our Service, you may be required to create an account. When creating an account, you agree to:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>Provide accurate, current, and complete information as prompted by our registration form.</li>
                <li>Maintain the security of your password and identification.</li>
                <li>Maintain and promptly update your registration data, and any other information you provide to us, to keep it accurate, current, and complete.</li>
                <li>Be fully responsible for all use of your account and for any actions that take place through your account.</li>
            </ul>
            <p class="mt-2">We reserve the right to suspend or terminate your account and refuse any and all current or future use of the Service if any information provided is inaccurate, not current, or incomplete, or if we have reasonable grounds to suspect that such information is inaccurate, not current, or incomplete.</p>
        `,
        intellectualProperty: `
            <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Air Classic Travel and its licensors. The Service is protected by copyright, trademark, and other laws of both Nigeria and foreign countries.</p>
            <p class="mt-2">Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Air Classic Travel. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as generally and ordinarily permitted through the Service according to these Terms.</p>
        `,
        prohibitedUses: `
            <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>In any way that violates any applicable national or international law or regulation.</li>
                <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
                <li>To impersonate or attempt to impersonate Air Classic Travel, a Air Classic Travel employee, another user, or any other person or entity.</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm Air Classic Travel or users of the Service or expose them to liability.</li>
            </ul>
            <p class="mt-2">Additionally, you agree not to:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>Use the Service in any manner that could disable, overburden, damage, or impair the Service or interfere with any other party's use of the Service.</li>
                <li>Use any robot, spider, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service.</li>
                <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
                <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
            </ul>
        `,
        disclaimers: `
            <p>YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE SERVICE IS PROVIDED WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.</p>
            <p class="mt-2">AIR CLASSIC TRAVEL DOES NOT WARRANT THAT A) THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURE OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; B) ANY ERRORS OR DEFECTS WILL BE CORRECTED; C) THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR D) THE RESULTS OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS.</p>
        `,
        limitationOfLiability: `
            <p>IN NO EVENT SHALL AIR CLASSIC TRAVEL, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.</p>
        `,
        indemnification: `
            <p>You agree to defend, indemnify, and hold harmless Air Classic Travel and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; or b) a breach of these Terms.</p>
        `,
        governingLaw: `
            <p>These Terms shall be governed and construed in accordance with the laws of <strong>Nigeria</strong>, without regard to its conflict of law provisions.</p>
            <p class="mt-2">Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.</p>
        `,
        changesToTerms: `
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            <p class="mt-2">By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
        `,
        contactUs: `
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul class="list-disc list-inside space-y-2 mt-2">
                <li>By email: <a href="mailto:support@voyageease.com" class="text-indigo-600 hover:underline">support@airclassictravel.com</a></li>
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
                    <div className="relative p-8 md:p-12 bg-gradient-to-r from-red-600 to-orange-700 text-white text-center">
                        <FileText size={60} className="mx-auto mb-4 opacity-80 drop-shadow-md" />
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg mb-2">
                            Terms and Conditions
                        </h1>
                        <p className="text-sm md:text-base opacity-90">
                            Effective Date: June 23, 2025
                        </p>
                    </div>

                    {/* Policy Content Sections */}
                    <div className="p-8 md:p-12 space-y-12">
                        {/* Introduction */}
                        <section className="animate-fade-in-up-stagger">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <ScrollText size={30} className="text-indigo-600 mr-3" /> Introduction
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.introduction }} />
                        </section>

                        {/* Acceptance of Terms */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={30} className="text-purple-600 mr-3" /> Acceptance of Terms
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.acceptance }} />
                        </section>

                        {/* Our Services */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Plane size={30} className="text-teal-600 mr-3" /> Our Services
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.services }} />
                        </section>

                        {/* User Accounts */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <UserCheck size={30} className="text-orange-600 mr-3" /> User Accounts
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.userAccounts }} />
                        </section>

                        {/* Intellectual Property Rights */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Lightbulb size={30} className="text-yellow-600 mr-3" /> Intellectual Property Rights
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.intellectualProperty }} />
                        </section>

                        {/* Prohibited Uses */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Ban size={30} className="text-red-600 mr-3" /> Prohibited Uses
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.prohibitedUses }} />
                        </section>

                        {/* Disclaimers */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <AlertTriangle size={30} className="text-amber-600 mr-3" /> Disclaimers
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.disclaimers }} />
                        </section>

                        {/* Limitation of Liability */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={30} className="text-cyan-600 mr-3" /> Limitation of Liability
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.limitationOfLiability }} />
                        </section>

                        {/* Indemnification */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <FileText size={30} className="text-emerald-600 mr-3" /> Indemnification
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.indemnification }} />
                        </section>

                        {/* Governing Law */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Scale size={30} className="text-blue-600 mr-3" /> Governing Law
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.governingLaw }} />
                        </section>

                        {/* Changes to These Terms */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Megaphone size={30} className="text-lime-600 mr-3" /> Changes to These Terms
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.changesToTerms }} />
                        </section>

                        {/* Contact Us */}
                        <section className="animate-fade-in-up-stagger-delay">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Mail size={30} className="text-gray-600 mr-3" /> Contact Us
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent.contactUs }} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Terms;
