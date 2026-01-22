'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import Providers from '@/components/Providers';
import { motion } from 'framer-motion';

function ForgotPasswordContent() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _router = useRouter(); // Available for future navigation needs
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Smart email auto-complete: detects student IDs (7-8 digits) and appends @horus.edu.eg
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // If user is deleting or the value already contains @, don't interfere
        if (value.includes('@') || value.length < email.length) {
            setEmail(value);
            return;
        }

        // Check if the value is purely 7 or 8 digits (Horus student ID pattern)
        if (/^\d{7,8}$/.test(value) && (value.length === 7 || value.length === 8)) {
            // Auto-append @horus.edu.eg
            setEmail(value + '@horus.edu.eg');
        } else {
            setEmail(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase() }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to send reset link');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Image src="/images/ui/navlogo.webp" alt="Verdict" width={64} height={64} className="h-16 w-auto mx-auto" style={{ width: 'auto' }} />
                    </Link>
                    <p className="text-white/60 mt-4 text-sm">Reset your password</p>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] mb-4"><Shield className="w-8 h-8" /></div>
                        <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
                        <p className="text-white/60 text-sm">Enter your email to receive recovery instructions</p>
                    </div>

                    {status === 'success' ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] mb-4"><CheckCircle className="w-8 h-8" /></div>
                            <h3 className="text-xl font-bold text-white mb-3">Check your email</h3>
                            <p className="text-white/70 text-sm leading-relaxed">{message}</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {status === 'error' && (<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start text-red-400 text-sm"><AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{message}</div>)}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Email Address</label>
                                <div className="relative">
                                    <input type="email" value={email} onChange={handleEmailChange} className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981]/50 transition-all pl-10" placeholder="Enter your student ID" required dir="ltr" />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                </div>
                            </div>

                            <button type="submit" disabled={status === 'loading'} className="w-full bg-[#10B981] hover:bg-[#c5963a] text-black font-bold rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#10B981]/20">
                                {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" />Sending...</> : <><ArrowRight className="w-5 h-5" />Send Reset Link</>}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center"><Link href="/login" className="text-sm text-white/60 hover:text-[#10B981] transition-colors inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 rotate-180" />Back to Login</Link></div>
                </div>

                <div className="mt-6 text-center"><Link href="/" className="text-sm text-white/40 hover:text-white/60 transition-colors">← Back to Home</Link></div>
            </motion.div>
        </div>
    );
}

export default function ForgotPassword() {
    return <Providers><ForgotPasswordContent /></Providers>;
}
