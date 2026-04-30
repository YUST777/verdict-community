import { Footer } from '@/components/landing';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                {/* Title */}
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-white/40 text-sm mb-12">Last Modified: March 22, 2026</p>

                {/* Intro */}
                <div className="prose prose-invert prose-emerald max-w-none">
                    <p className="text-white/70 text-lg leading-relaxed mb-8">
                        These Terms of Service (this &quot;Agreement&quot;) are a binding contract between you (&quot;Customer,&quot; &quot;you,&quot; or &quot;your&quot;) and Verdict.run (&quot;Verdict,&quot; &quot;we,&quot; or &quot;us&quot;). This Agreement governs your access to and use of the Verdict platform and services.
                    </p>

                    {/* Agreement Acceptance */}
                    <section className="mb-12">
                        <h2 id="agreement-acceptance" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            Agreement Acceptance
                            <a href="#agreement-acceptance" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-white/60 leading-relaxed">
                            <p className="mb-4">
                                THIS AGREEMENT TAKES EFFECT WHEN YOU ACCEPT THE TERMS DURING SIGN-UP OR BY ACCESSING OR USING THE SERVICES (the &quot;Effective Date&quot;). BY ACCEPTING THE TERMS DURING SIGN-UP OR BY ACCESSING OR USING THE SERVICES YOU:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4">
                                <li>ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS AGREEMENT;</li>
                                <li>REPRESENT AND WARRANT THAT YOU HAVE THE RIGHT, POWER, AND AUTHORITY TO ENTER INTO THIS AGREEMENT;</li>
                                <li>ACCEPT THIS AGREEMENT AND AGREE THAT YOU ARE LEGALLY BOUND BY ITS TERMS.</li>
                            </ul>
                            <p className="font-semibold text-white/80">
                                IF YOU DO NOT ACCEPT THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICES.
                            </p>
                        </div>
                    </section>

                    {/* Section 1 */}
                    <section className="mb-12">
                        <h2 id="definitions" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            1. Definitions
                            <a href="#definitions" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <div className="space-y-4 text-white/70">
                            <p><strong className="text-white">&quot;Authorized User&quot;</strong> means your employees, consultants, contractors, and agents who are authorized by you to access and use the Services under the rights granted pursuant to this Agreement.</p>
                            <p><strong className="text-white">&quot;Customer Data&quot;</strong> means information, data, and other content, in any form or medium, that is submitted, posted, or otherwise transmitted by or on behalf of you through the Services.</p>
                            <p><strong className="text-white">&quot;Services&quot;</strong> means Verdict&apos;s proprietary hosted software platform, including the web application, browser extension, and related tools for competitive programming.</p>
                            <p><strong className="text-white">&quot;Documentation&quot;</strong> means Verdict&apos;s end user documentation relating to the Services available at verdict.run.</p>
                            <p><strong className="text-white">&quot;Third-Party Products&quot;</strong> means any third-party products provided with, integrated with, or incorporated into the Services, including but not limited to Codeforces integration.</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <h2 id="access-and-use" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            2. Access and Use
                            <a href="#access-and-use" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>

                        <h3 className="text-lg font-medium text-white mb-3">a. Provision of Access</h3>
                        <p className="text-white/70 mb-6">
                            Subject to and conditioned on your compliance with the terms and conditions of this Agreement, Verdict will make available to you during the Subscription Period, on a non-exclusive, non-transferable, and non-sublicensable basis, access to and use of the Services, solely for use by Authorized Users.
                        </p>

                        <h3 className="text-lg font-medium text-white mb-3">b. Use Restrictions</h3>
                        <p className="text-white/70 mb-4">You shall not at any time, directly or indirectly:</p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li>Copy, modify, or create derivative works of the Services</li>
                            <li>Rent, lease, lend, sell, license, or distribute the Services to any third party</li>
                            <li>Reverse engineer, disassemble, or decompile any part of the Services</li>
                            <li>Use the Services for competitive analysis or to develop competing products</li>
                            <li>Bypass any security measures or access the Services through unauthorized means</li>
                            <li>Upload or transmit any malicious code or harmful content</li>
                            <li>Use the Services in violation of any applicable law</li>
                        </ul>

                        <h3 className="text-lg font-medium text-white mb-3">c. Suspension</h3>
                        <p className="text-white/70">
                            Verdict may temporarily suspend your access to the Services if we reasonably determine that there is a threat or attack on our systems, your use disrupts the Services for other users, you are using the Services for fraudulent or illegal activities, or your provision of Services is prohibited by applicable law.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <h2 id="customer-responsibilities" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            3. Customer Responsibilities
                            <a href="#customer-responsibilities" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            You are responsible and liable for all uses of the Services resulting from access provided by you, directly or indirectly. You are responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/70">
                            <li>All Customer Data, including its content and use</li>
                            <li>Your information technology infrastructure and systems</li>
                            <li>The security and use of your access credentials</li>
                            <li>All access to and use of the Services through your account</li>
                            <li>Ensuring compliance with Codeforces&apos; terms of service when using our submission features</li>
                        </ul>
                    </section>

                    {/* Section 4 - Data Collection & Storage (NEW) */}
                    <section className="mb-12">
                        <h2 id="data-collection" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            4. Data Collection and Storage
                            <a href="#data-collection" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>

                        <h3 className="text-lg font-medium text-white mb-3">a. Data We Collect and Store</h3>
                        <p className="text-white/70 mb-4">
                            When you use the Services, we collect and store certain data on our servers to provide and improve the platform experience. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li><strong className="text-white">AI Chat Messages:</strong> Conversations with the AI assistant, including your questions, code snippets shared in context, and AI-generated responses, are stored on our servers to enable chat history, multi-tab conversations, and continued sessions across devices.</li>
                            <li><strong className="text-white">User Profile Data:</strong> Your email address (encrypted at rest), Codeforces handle, account preferences, and authentication identifiers.</li>
                            <li><strong className="text-white">Problem Sheets and Workspace State:</strong> Your saved problem sheets, open tabs, and workspace configuration are stored to synchronize your session across devices.</li>
                            <li><strong className="text-white">Video Scripts:</strong> AI-generated video explainer scripts and any shared videos are stored on our servers.</li>
                            <li><strong className="text-white">Usage Metadata:</strong> Problem view history and submission activity for analytics and caching purposes.</li>
                        </ul>

                        <h3 className="text-lg font-medium text-white mb-3">b. Data We Do NOT Store on Our Servers</h3>
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6 text-sm text-white/70 leading-relaxed mb-6">
                            <p className="mb-4">
                                <strong className="text-emerald-400">Your API Keys are never stored on our servers.</strong> When you configure an AI provider (such as OpenAI, Anthropic, or Google), the API key you provide is stored exclusively in your browser&apos;s local storage (localStorage). It is sent directly from your browser to the AI provider&apos;s API and is never transmitted to, logged by, or persisted on Verdict&apos;s servers.
                            </p>
                            <p>
                                This means if you clear your browser data or switch devices, you will need to re-enter your API key. We recommend keeping a secure backup of your keys.
                            </p>
                        </div>

                        <h3 className="text-lg font-medium text-white mb-3">c. Data Retention</h3>
                        <p className="text-white/70">
                            We retain your data for as long as your account is active or as needed to provide the Services. You may request deletion of your account and associated data by contacting us. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law.
                        </p>
                    </section>

                    {/* Section 5 - Cookies (NEW) */}
                    <section className="mb-12">
                        <h2 id="cookies" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            5. Cookies and Local Storage
                            <a href="#cookies" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            Verdict uses cookies and browser local storage to operate the platform:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/70 mb-6">
                            <li><strong className="text-white">Authentication Cookies:</strong> We use secure, HTTP-only cookies to maintain your login session. These are essential for the Services to function and cannot be disabled while using the platform.</li>
                            <li><strong className="text-white">Supabase Auth Cookies:</strong> Our authentication provider (Supabase) sets cookies to manage OAuth sessions with Google and GitHub.</li>
                            <li><strong className="text-white">Local Storage:</strong> We use browser local storage to persist your AI provider API keys, editor preferences, theme settings, and other client-side configuration. This data never leaves your browser.</li>
                            <li><strong className="text-white">Verdict Helper Browser Extension:</strong> When you use the Verdict Helper browser extension to submit solutions to Codeforces, the extension reads your Codeforces session cookies solely to authenticate the submission on your behalf. These cookies are transmitted to our server for the duration of the submission request only and are never stored, logged, or persisted on our servers.</li>
                        </ul>
                        <p className="text-white/70">
                            We do not use third-party tracking cookies or advertising cookies. By using the Services, you consent to the use of essential cookies and local storage as described above.
                        </p>
                    </section>

                    {/* Section 6 (was 4) */}
                    <section className="mb-12">
                        <h2 id="fees" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            6. Fees and Payment
                            <a href="#fees" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            Where paid services are agreed between Verdict and Customer, you shall pay Verdict the fees identified without offset or deduction. Fees paid are non-refundable unless otherwise specified.
                        </p>
                        <p className="text-white/70">
                            All fees are exclusive of taxes. You are responsible for all sales, use, and excise taxes, and any other similar taxes, duties, and charges imposed by any governmental authority.
                        </p>
                    </section>

                    {/* Section 7 (was 5) */}
                    <section className="mb-12">
                        <h2 id="intellectual-property" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            7. Intellectual Property
                            <a href="#intellectual-property" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            <strong className="text-white">Verdict IP:</strong> You acknowledge that Verdict owns all right, title, and interest, including all intellectual property rights, in and to the Services, Documentation, and all related technology.
                        </p>
                        <p className="text-white/70">
                            <strong className="text-white">Customer Data:</strong> You retain all right, title, and interest in your Customer Data. You grant Verdict a non-exclusive license to use your Customer Data solely to provide the Services.
                        </p>
                    </section>

                    {/* Section 8 (was 6) */}
                    <section className="mb-12">
                        <h2 id="disclaimer" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            8. Disclaimer of Warranties
                            <a href="#disclaimer" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-white/60">
                            <p>
                                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND VERDICT HEREBY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. VERDICT SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. VERDICT MAKES NO WARRANTY THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, OPERATE WITHOUT INTERRUPTION, BE SECURE, ACCURATE, COMPLETE, OR ERROR FREE.
                            </p>
                        </div>
                    </section>

                    {/* Section 9 (was 7) */}
                    <section className="mb-12">
                        <h2 id="limitation" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            9. Limitation of Liability
                            <a href="#limitation" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-white/60">
                            <p>
                                IN NO EVENT WILL VERDICT BE LIABLE FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL, OR PUNITIVE DAMAGES; LOST PROFITS, REVENUE, OR BUSINESS; LOSS OF DATA; OR COST OF REPLACEMENT SERVICES. VERDICT&apos;S AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT WILL NOT EXCEED THE TOTAL AMOUNTS PAID TO VERDICT IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                            </p>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-3 mt-6">Third-Party Platform Risks</h3>
                        <p className="text-white/70">
                            Verdict integrates with third-party platforms such as Codeforces. Verdict is not responsible for any account restrictions, suspensions, bans, rate limiting, or other actions taken by Codeforces or any third-party platform against your account as a result of using the Services, including but not limited to the Verdict Helper browser extension. You use these integration features at your own risk and acknowledge that third-party platforms may enforce their own policies independently of Verdict.
                        </p>
                    </section>

                    {/* Section 10 (was 8) */}
                    <section className="mb-12">
                        <h2 id="termination" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            10. Termination
                            <a href="#termination" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70 mb-4">
                            Either party may terminate this Agreement if the other party materially breaches this Agreement and such breach remains uncured thirty (30) days after written notice.
                        </p>
                        <p className="text-white/70">
                            Upon termination, you shall immediately discontinue use of the Services. No termination will affect your obligation to pay any fees that became due before termination.
                        </p>
                    </section>

                    {/* Section 11 (was 9) */}
                    <section className="mb-12">
                        <h2 id="governing-law" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            11. Governing Law
                            <a href="#governing-law" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            This Agreement will be governed by and construed in accordance with applicable laws. Any disputes arising from this Agreement shall be resolved through binding arbitration, and you waive any right to participate in class action lawsuits.
                        </p>
                    </section>

                    {/* Section 12 (was 10) */}
                    <section className="mb-12">
                        <h2 id="changes" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            12. Changes to Terms
                            <a href="#changes" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            Verdict may modify this Agreement from time to time. We will provide reasonable notice of any material changes. Your continued use of the Services after such changes constitutes acceptance of the modified Agreement.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 id="contact" className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            Contact
                            <a href="#contact" className="text-emerald-500 opacity-0 hover:opacity-100 transition-opacity">#</a>
                        </h2>
                        <p className="text-white/70">
                            If you have any questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:legal@verdict.run" className="text-emerald-400 hover:underline">legal@verdict.run</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}