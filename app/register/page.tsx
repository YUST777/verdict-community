'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Github, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

// Zod validation schema
const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength calculator
const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 3) return { strength: 30, label: 'Weak', color: 'bg-red-500' };
    if (score < 4) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (score < 5) return { strength: 75, label: 'Good', color: 'bg-emerald-400' };
    return { strength: 100, label: 'Strong', color: 'bg-emerald-500' };
};

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_touched, _setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});

    const supabase = createClient();
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const passwordStrength = getPasswordStrength(password);

    // Password requirements
    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
    ];

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    // Validate a single field
    const validateField = (field: keyof RegisterFormData, value: string) => {
        try {
            registerSchema.shape[field].parse(value);
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (err) {
            if (err instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [field]: err.issues[0].message }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        // Validate all fields
        const result = registerSchema.safeParse({ email, password });

        if (!result.success) {
            const fieldErrors: Partial<RegisterFormData> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof RegisterFormData;
                if (!fieldErrors[field]) {
                    fieldErrors[field] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        setSubmitError('');
        setErrors({});
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data?.session) {
                // If we got a session, we are logged in immediately (auto confirm off or test env)
                login(data.session.access_token);
                // router.replace handled by login
            } else if (data?.user) {
                // User created but verification required
                alert('Account created! Please check your email to verify your account.');
                router.push('/login');
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'github' | 'google') => {
        try {
            const returnUrl = process.env.NEXT_PUBLIC_SITE_URL
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
                : `${window.location.origin}/api/auth/callback`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: returnUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('OAuth Error:', error);
            setSubmitError('Failed to sign up with ' + provider);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#171717] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#171717] flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
                <div className="w-full max-w-[400px]">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-2 mb-10">
                        <Image src="/icons/logo.webp" alt="Verdict" width={28} height={28} />
                        <span className="text-sm font-medium text-white/60">v1.0.1</span>
                    </Link>

                    {/* Header */}
                    <h1 className="text-3xl font-semibold text-white mb-2">Get started</h1>
                    <p className="text-white/50 text-sm mb-8">Create a new account</p>

                    {/* GitHub Button */}
                    <button
                        onClick={() => handleOAuthLogin('github')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-transparent border border-white/10 rounded-md text-white text-sm font-medium hover:bg-white/5 transition-colors mb-3"
                    >
                        <Github size={18} />
                        Continue with GitHub
                    </button>

                    {/* Google Button */}
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-transparent border border-white/10 rounded-md text-white text-sm font-medium hover:bg-white/5 transition-colors mb-4"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>



                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-white/30 text-xs">or</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {submitError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-400 text-sm">
                                {submitError}
                            </div>
                        )}

                        <div>
                            <label className="block text-white/70 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) validateField('email', e.target.value);
                                }}
                                onBlur={() => validateField('email', email)}
                                placeholder="you@example.com"
                                className={`w-full px-4 py-3 bg-transparent border rounded-md text-white text-sm placeholder-white/30 focus:outline-none transition-colors ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/30'
                                    }`}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-white/70 text-sm mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) validateField('password', e.target.value);
                                    }}
                                    onBlur={() => validateField('password', password)}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-transparent border rounded-md text-white text-sm placeholder-white/30 focus:outline-none transition-colors pr-11 ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/30'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1.5">{errors.password}</p>
                            )}

                            {/* Password Strength */}
                            {password && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-white/40">Password strength</span>
                                        <span className={passwordStrength.strength >= 75 ? 'text-emerald-400' : 'text-white/60'}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full transition-all ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        />
                                    </div>

                                    {/* Requirements */}
                                    <div className="mt-3 space-y-1">
                                        {requirements.map((req, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                {req.met ? (
                                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                                ) : (
                                                    <XCircle size={12} className="text-white/30" />
                                                )}
                                                <span className={req.met ? 'text-white/70' : 'text-white/40'}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign up'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-white/40 text-sm text-center mt-6">
                        Have an account?{' '}
                        <Link href="/login" className="text-white hover:underline">
                            Sign in
                        </Link>
                    </p>

                    {/* Terms */}
                    <p className="text-white/30 text-xs text-center mt-6 leading-relaxed">
                        By continuing, you agree to Verdict&apos;s{' '}
                        <Link href="/terms" className="underline hover:text-white/50">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>.
                    </p>
                </div>
            </div>

            {/* Right Side - Testimonial */}
            <div className="hidden lg:flex w-[60%] items-center justify-center bg-[#0a0a0a] border-l border-white/5 px-20">
                <div className="max-w-lg">
                    {/* Quote Icon */}
                    <div className="text-emerald-500 text-6xl font-serif mb-6">&quot;</div>

                    {/* Quote */}
                    <blockquote className="text-2xl lg:text-3xl text-white/90 font-medium leading-relaxed mb-8">
                        Finally a platform that gets it right. I submitted my first problem in under 30 seconds. The interface is clean and the extension works flawlessly!
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-semibold">
                            A
                        </div>
                        <span className="text-white/60 text-sm">@coder_ali</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
