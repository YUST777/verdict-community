import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <Image src="/icons/logo.webp" alt="Verdict" width={24} height={24} />
                        <span className="text-sm font-medium text-white/60">v1.0.1</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Title */}
                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-white/40 text-sm mb-12">Last Modified: January 15, 2026</p>

                {/* Intro */}
                <div className="prose prose-invert prose-emerald max-w-none">
                    <p className="text-white/70 text-lg leading-relaxed mb-8">
                        Thank you for your interest in Verdict.run (&quot;Verdict,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Verdict provides a seamless competitive programming platform with integrated code submission to Codeforces. This Privacy Policy explains how information about you, that directly identifies you, or that makes you identifiable (&quot;personal information&quot;) is collected, used and disclosed by Verdict in connection with our website at verdict.run (the &quot;Site&quot;) and our services offered in connection with the Site (collectively with the Site, the &quot;Service&quot;).
                    </p>

                    {/* Table of Contents */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-12">
                        <h3 className="text-lg font-semibold mb-4">Contents</h3>
                        <ul className="space-y-2 text-emerald-400">
                            <li><a href="#what-applies" className="hover:underline">What Does This Privacy Policy Apply To?</a></li>
                            <li><a href="#information-collect" className="hover:underline">1. Information We Collect and Our Use</a></li>
                            <li><a href="#how-share" className="hover:underline">2. How We Share Personal Information</a></li>
                            <li><a href="#control" className="hover:underline">3. Control Over Your Information</a></li>
                            <li><a href="#cookies" className="hover:underline">4. How We Use Cookies and Tracking Technology</a></li>
                            <li><a href="#retention" className="hover:underline">5. Data Retention and Security</a></li>
                            <li><a href="#third-party" className="hover:underline">6. Links to Third-Party Websites</a></li>
                            <li><a href="#children" className="hover:underline">7. Children&apos;s Privacy</a></li>
                            <li><a href="#changes" className="hover:underline">8. Changes to This Privacy Policy</a></li>
                            <li><a href="#contact" className="hover:underline">9. Contact Us</a></li>
                            <li><a href="#eu-disclosures" className="hover:underline">Privacy Disclosures for EU, UK and Switzerland</a></li>
                        </ul>
                    </div>

                    {/* What Applies */}
                    <section className="mb-12">
                        <h2 id="what-applies" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            What Does This Privacy Policy Apply To?
                            <a href="#what-applies" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            This Privacy Policy explains how we use your personal information when you use the Service, either as an individual customer or when you access the Service through one of our enterprise customers&apos; accounts. We are the data controller of your personal information when we use it as described in this Privacy Policy.
                        </p>
                        <p className="text-white/70 mb-4">
                            Our Service allows customers to submit code, manage problem solutions, and interact with Codeforces through our browser extension (&quot;Customer Data&quot;). We process such Customer Data on behalf of and under the instructions of the relevant customer.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-sm text-white/60">
                            <strong className="text-emerald-400">Regional Disclosures:</strong> If you are located in the European Economic Area, United Kingdom, or Switzerland, please see the Privacy Disclosures section at the end of this policy for additional information about your rights.
                        </div>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <h2 id="information-collect" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            1. Information We Collect and Our Use
                            <a href="#information-collect" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-6">
                            We collect personal information in connection with your visits to and use of the Service. This collection includes information that you provide, information from third parties, and information collected automatically.
                        </p>

                        <h3 className="text-lg font-medium text-white mb-3">Information That You Provide</h3>
                        <div className="space-y-4 text-white/70 mb-6">
                            <p><strong className="text-white">Registration Information.</strong> We collect personal information when you register for an account. This may include your name, email address, and GitHub username. We use this information to administer your account and provide you with the relevant services.</p>
                            <p><strong className="text-white">Payment Information.</strong> If you make a purchase, we collect transactional information. We use third-party payment processors (such as Stripe), and do not store credit card information directly.</p>
                            <p><strong className="text-white">Communications.</strong> If you communicate with us, we may collect your name, email address, and the contents of your communication. We use this to investigate and respond to your inquiries.</p>
                            <p><strong className="text-white">User Content.</strong> You may create, upload, or transmit code, solutions, and other content as part of your use of the Service. This User Content is stored as part of the Service, and you have full control over it.</p>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-3">Information from Third-Party Sources</h3>
                        <div className="space-y-4 text-white/70 mb-6">
                            <p><strong className="text-white">Single Sign-On.</strong> We use SSO providers such as GitHub to authenticate your account. We receive information such as your name, username, email address, and profile picture in accordance with their authorization procedures.</p>
                            <p><strong className="text-white">Codeforces Integration.</strong> When you use our browser extension to submit code to Codeforces, we process your Codeforces username and submission data to facilitate the submission process.</p>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-3">Other Uses of Personal Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-white/70">
                            <li>To operate the Service and provide features and functionality</li>
                            <li>To communicate with you and respond to requests</li>
                            <li>For analytics and research purposes</li>
                            <li>To enforce our Terms of Service and protect our rights</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <h2 id="how-share" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            2. How We Share Personal Information
                            <a href="#how-share" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">We may share your personal information in the following instances:</p>
                        <ul className="list-disc list-inside space-y-3 text-white/70">
                            <li><strong className="text-white">Service Providers:</strong> Third-party vendors who help us deliver or improve our services, including hosting, analytics, and payment processing.</li>
                            <li><strong className="text-white">Legal Requirements:</strong> When required by law or to comply with legal process, or to protect the security and integrity of our services.</li>
                            <li><strong className="text-white">Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition of all or a portion of our business.</li>
                            <li><strong className="text-white">With Your Consent:</strong> When you authorize us to share your information with third parties.</li>
                            <li><strong className="text-white">Aggregated Data:</strong> In an aggregated or anonymized form that does not identify you.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <h2 id="control" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            3. Control Over Your Information
                            <a href="#control" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>

                        <h3 className="text-lg font-medium text-white mb-3">Email Communications</h3>
                        <p className="text-white/70 mb-6">
                            If you wish to unsubscribe from promotional emails, simply click the &quot;unsubscribe link&quot; at the bottom of the email. Note that you cannot unsubscribe from service-related communications (e.g., account verification, transaction confirmations).
                        </p>

                        <h3 className="text-lg font-medium text-white mb-3">Modifying Account Information</h3>
                        <p className="text-white/70">
                            You can modify certain information in your account through the account settings. If you would like to request access to, correction, or deletion of personal information, please contact us at the email provided below.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <h2 id="cookies" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            4. How We Use Cookies and Tracking Technology
                            <a href="#cookies" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            We use cookies and similar tracking technologies to collect usage information automatically. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li>Information about your device (IP address, browser type, operating system)</li>
                            <li>Information about how you access and use our services</li>
                            <li>The pages you visit and links you click</li>
                        </ul>
                        <p className="text-white/70 mb-4">We use this data to:</p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li>Remember your preferences</li>
                            <li>Provide custom content</li>
                            <li>Monitor the effectiveness of our services</li>
                            <li>Diagnose technical problems</li>
                        </ul>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/60">
                            <strong className="text-white">Cookie Opt-Out:</strong> Most browsers allow you to manage cookie settings. You can set your browser to delete or reject cookies, though this may affect your experience with certain features.
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <h2 id="retention" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            5. Data Retention and Security
                            <a href="#retention" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                        </p>
                        <p className="text-white/70 mb-4">
                            Verdict uses commercially reasonable physical, technical, and organizational measures to protect your information. However, no security system is impenetrable, and we cannot guarantee absolute security.
                        </p>
                        <p className="text-white/70">
                            In the event of a security breach, we will take reasonable steps to investigate and notify affected individuals in accordance with applicable laws.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <h2 id="third-party" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            6. Links to Third-Party Websites
                            <a href="#third-party" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            Our Service may contain links to third-party websites, including Codeforces. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 id="children" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            7. Children&apos;s Privacy
                            <a href="#children" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected information from a child under 13, we will delete it promptly. Please contact us if you believe we may have collected information from a child.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 id="changes" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            8. Changes to This Privacy Policy
                            <a href="#changes" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &quot;Last Modified&quot; date and, where appropriate, sending you a notification. Your continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-12">
                        <h2 id="contact" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            9. Contact Us
                            <a href="#contact" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            For inquiries about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:privacy@verdict.run" className="text-emerald-400 hover:underline">privacy@verdict.run</a>.
                        </p>
                    </section>

                    {/* EU Disclosures */}
                    <section className="mb-12">
                        <h2 id="eu-disclosures" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            Privacy Disclosures for EU, UK, and Switzerland
                            <a href="#eu-disclosures" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-6">
                            The following disclosures apply if you access the Service from the European Economic Area, United Kingdom, or Switzerland.
                        </p>

                        <h3 className="text-lg font-medium text-white mb-3">Your Rights</h3>
                        <p className="text-white/70 mb-4">In accordance with applicable privacy law, you have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li><strong className="text-white">Right of Access:</strong> Obtain confirmation of whether we process your personal information and request a copy.</li>
                            <li><strong className="text-white">Right to Portability:</strong> Receive your personal information in a portable format.</li>
                            <li><strong className="text-white">Right to Rectification:</strong> Request correction of inaccurate information.</li>
                            <li><strong className="text-white">Right to Erasure:</strong> Request deletion of your personal information in certain circumstances.</li>
                            <li><strong className="text-white">Right to Restriction:</strong> Request limitation of processing in certain circumstances.</li>
                            <li><strong className="text-white">Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent.</li>
                            <li><strong className="text-white">Right to Object:</strong> Object to processing based on legitimate interests.</li>
                        </ul>

                        <h3 className="text-lg font-medium text-white mb-3">International Transfers</h3>
                        <p className="text-white/70 mb-4">
                            Your personal information may be transferred to and stored in countries outside of your jurisdiction, including the United States. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission.
                        </p>

                        <h3 className="text-lg font-medium text-white mb-3">Data Protection Authority</h3>
                        <p className="text-white/70">
                            You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-white/40">
                    <span>© 2026 Verdict.run</span>
                    <div className="flex items-center gap-6">
                        <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
                        <Link href="/" className="hover:text-white/60 transition-colors">Back to Home</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
