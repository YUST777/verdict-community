'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed'); return; }
            setSent(true);
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
            <div className="w-full max-w-[400px]">
                <Link href="/register" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to login
                </Link>

                <Link href="/" className="flex items-center gap-2 text-emerald-500 font-bold text-xl mb-8">
                    <Image src="/icons/logo.svg" alt="Verdict" width={28} height={28} />
                    Verdict
                </Link>

                {sent ? (
                    <div className="text-center">
                        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                        <p className="text-white/50 text-sm mb-6">If an account exists for {email}, we sent a reset link.</p>
                        <Link href="/register" className="text-emerald-400 text-sm hover:underline">Back to login</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
                        <p className="text-white/50 text-sm mb-8">Enter your email and we'll send a reset link</p>

                        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@university.edu.eg"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send reset link'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
