'use client';

import { useState } from 'react';
import { X, Loader2, Github } from 'lucide-react';
import Link from 'next/link';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleOAuth = async (provider: 'github' | 'google') => {
        try {
            setLoading(true);

            // Redirect through our server-side OAuth routes which handle
            // cookie domain scoping correctly for cross-subdomain auth
            const returnUrl = window.location.href;
            window.location.href = `/api/auth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'OAuth failed');
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

                    {/* Terms of Service */}
                    <p className="text-center text-xs text-white/40 leading-relaxed">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" target="_blank">
                            Terms of Service
                        </Link>
                    </p>

                    {error && (
                        <div className="text-sm px-4 py-3 mt-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
