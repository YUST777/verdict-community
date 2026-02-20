'use client';

import { useState } from 'react';
import { X, LogIn, Mail, Lock, Eye, EyeOff, Loader2, Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    title?: string;
    subtitle?: string;
}

export default function SignInModal({
    isOpen,
    onClose,
    onSuccess,
    title = 'Sign in to continue',
    subtitle = 'You need to sign in to use AI features'
}: SignInModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const supabase = createClient();

    if (!isOpen) return null;

    const handleOAuth = async (provider: 'github' | 'google') => {
        try {
            setLoading(true);

            // Store the current page URL to redirect back after auth
            const returnUrl = window.location.href;

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
                }
            });

            if (oauthError) throw oauthError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OAuth failed');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success (Cookie is set by server)
            onSuccess?.();
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
                >
                    <X size={18} strokeWidth={3} />
                </button>

                {/* Header */}
                <div className="px-8 pt-8 pb-6 text-center border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-sm text-white/60 mt-1">{subtitle}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleOAuth('google')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => handleOAuth('github')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] hover:bg-[#2f363d] text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            <Github size={18} strokeWidth={2.5} />
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-[#1a1a1a] text-white/40">or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm text-white/70 font-medium">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={2.5} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-white/70 font-medium">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" strokeWidth={2.5} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <>
                                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle mode */}
                    <p className="text-center text-sm text-white/50 mt-6">
                        {mode === 'signin' ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setMode('signin')}
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
