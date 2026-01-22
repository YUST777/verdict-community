'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Providers from '@/components/Providers';
import { motion } from 'framer-motion';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);

    // Initialize status based on params validity
    const isValidParams = !!(token && email);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(isValidParams ? 'idle' : 'error');
    const [message, setMessage] = useState(isValidParams ? '' : 'Invalid or missing reset link parameters.');

    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        if (/^\d+$/.test(pwd)) return { strength: 10, label: 'Weak', color: 'bg-red-500' };
        if (/^[a-zA-Z]+$/.test(pwd)) return { strength: 20, label: 'Weak', color: 'bg-red-500' };
        if (/(.)\1{2,}/.test(pwd)) return { strength: 10, label: 'Weak', color: 'bg-red-500' };
        let score = 0;
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[a-z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        if (score < 3) return { strength: 30, label: 'Weak', color: 'bg-red-500' };
        if (score < 4) return { strength: 60, label: 'Good', color: 'bg-yellow-500' };
        if (score < 5) return { strength: 80, label: 'Strong', color: 'bg-green-400' };
        return { strength: 100, label: 'Very Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { setStatus('error'); setMessage('Passwords do not match'); return; }
        if (formData.password.length < 8) { setStatus('error'); setMessage('Password must be at least 8 characters long'); return; }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: formData.password }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again later.');
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Invalid Link</h2>
                    <p className="text-white/60 mb-6">This password reset link is invalid or incomplete.</p>
                    <Link href="/forgot-password" className="text-[#10B981] hover:text-[#c5963a] font-semibold transition-colors">Request a new link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl"></div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block"><Image src="/images/ui/navlogo.webp" alt="Verdict" width={64} height={64} className="h-16 w-auto mx-auto" style={{ width: 'auto' }} /></Link>
                    <p className="text-white/60 mt-4 text-sm">Create a new password</p>
                </div>

                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10B981]/10 text-[#10B981] mb-4"><Lock className="w-8 h-8" /></div>
                        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-white/60 text-sm">Create a new password for your account.</p>
                    </div>

                    {status === 'success' ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] mb-4"><CheckCircle className="w-8 h-8" /></div>
                            <h3 className="text-xl font-bold text-white mb-3">Password Reset Successful</h3>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">Your password has been updated. Redirecting to login...</p>
                            <Link href="/login" className="inline-block px-6 py-3 bg-[#10B981] hover:bg-[#c5963a] text-black rounded-xl font-bold transition-all">Login Now</Link>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {status === 'error' && (<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start text-red-400 text-sm"><AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />{message}</div>)}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981]/50 transition-all pl-10 pr-10" placeholder="Enter new password (min 8 chars)" required minLength={8} dir="ltr" />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                </div>
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-xs mb-1"><span className="text-white/40">Password strength</span><span className={`${passwordStrength.strength >= 60 ? 'text-green-400' : 'text-white/60'}`}>{passwordStrength.label}</span></div>
                                        <div className="w-full bg-white/10 rounded-full h-1.5"><div className={`h-1.5 rounded-full transition-all ${passwordStrength.color}`} style={{ width: `${passwordStrength.strength}%` }}></div></div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">Confirm Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981]/50 transition-all pl-10" placeholder="Confirm new password" required dir="ltr" />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                </div>
                            </div>

                            <button type="submit" disabled={status === 'loading'} className="w-full bg-[#10B981] hover:bg-[#c5963a] text-black font-bold rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#10B981]/20">
                                {status === 'loading' ? <><span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />Resetting...</> : <><ArrowRight className="w-5 h-5" />Reset Password</>}
                            </button>
                        </form>
                    )}

                    {status !== 'success' && (<div className="mt-6 text-center"><Link href="/login" className="text-sm text-white/60 hover:text-[#10B981] transition-colors inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 rotate-180" />Back to Login</Link></div>)}
                </div>

                <div className="mt-6 text-center"><Link href="/" className="text-sm text-white/40 hover:text-white/60 transition-colors">← Back to Home</Link></div>
            </motion.div>
        </div>
    );
}

function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}

export default function ResetPassword() {
    return <Providers><ResetPasswordPage /></Providers>;
}
