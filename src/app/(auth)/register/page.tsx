'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ArrowLeft, Github, ChevronDown, Check } from 'lucide-react';
import { z } from 'zod';

import { facultyOptions, levelOptions } from './constants';

// Google Icon SVG component
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
        <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
        <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
        <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
    </svg>
);

// ─── Custom Dropdown Component ──────────────────────────────────────

interface DropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder: string;
    error?: string;
}

function CustomDropdown({ value, onChange, options, placeholder, error }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full px-4 py-3 bg-white/5 border rounded-lg text-sm text-left flex items-center justify-between transition-all',
                    error ? 'border-red-500/50' : 'border-white/10',
                    isOpen ? 'border-emerald-500/50 bg-white/[0.07]' : '',
                    selectedOption ? 'text-white' : 'text-white/30'
                )}
            >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                <ChevronDown size={16} className={cn('text-white/30 transition-transform', isOpen && 'rotate-180')} />
            </button>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-white/5 transition-colors',
                                value === option.value ? 'text-emerald-500 bg-emerald-500/5' : 'text-white/80'
                            )}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <Check size={14} className="text-emerald-500" />}
                        </button>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ─── Validation Schemas ─────────────────────────────────────────────

const emailSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .refine(
            (val) => val.toLowerCase().endsWith('.edu.eg'),
            'Please use your university email ending in .edu.eg'
        ),
});

const passwordSchema = z.object({
    password: z.string()
        .min(9, 'Password must be at least 9 characters')
        .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
        .regex(/[a-z]/, 'Password needs at least one lowercase letter')
        .regex(/[0-9]/, 'Password needs at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const loginPasswordSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

type FormErrors = {
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    telephone?: string;
    faculty?: string;
    studentId?: string;
    nationalId?: string;
    studentLevel?: string;
    codeforcesProfile?: string;
};

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

type AuthMode = 'unknown' | 'login' | 'register';
type Step = 'email' | 'otp' | 'password' | 'profile';

function UniversityAuthContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const isEduMode = mode === 'edu';

    const [step, setStep] = useState<Step>('email');
    const [authMode, setAuthMode] = useState<AuthMode>('unknown');
    const [universityName, setUniversityName] = useState<string | null>(null);

    // Email step
    const [email, setEmail] = useState('');

    // OTP step
    const [otp, setOtp] = useState('');

    // Password step (login or register)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Profile Info (register only)
    const [formData, setFormData] = useState({
        name: '',
        telephone: '',
        faculty: '',
        studentId: '',
        nationalId: '',
        studentLevel: '',
        codeforcesProfile: '',
        leetcodeProfile: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const otpInputRef = useRef<HTMLInputElement>(null);
    const isSubmittingRef = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: string | boolean = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'nationalId') {
            newValue = value.replace(/\D/g, '');
        }

        if (name === 'telephone') {
            newValue = value.replace(/[^\d+]/g, '');
            if (newValue && !newValue.startsWith('+20')) {
                if (newValue.startsWith('20')) {
                    newValue = '+' + newValue;
                } else if (newValue.startsWith('0')) {
                    newValue = '+20' + newValue.substring(1);
                } else if (!newValue.startsWith('+')) {
                    newValue = '+20' + newValue;
                }
            }
            if (typeof newValue === 'string' && newValue.length > 13) {
                newValue = newValue.substring(0, 13);
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const sendOtp = async () => {
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send code');
        return data;
    };

    const handleOAuthLogin = (provider: 'google' | 'github' | 'codeforces') => {
        setOauthLoading(provider === 'codeforces' ? 'google' as any : provider);
        
        // Pass the current page URL as returnUrl so the callback brings us back here
        const currentUrl = window.location.href;
        window.location.href = `/api/auth/${provider}?returnUrl=${encodeURIComponent(currentUrl)}`;
    };

    const handleEmailSubmit = async () => {
        const emailResult = emailSchema.safeParse({ email });

        if (!emailResult.success) {
            setErrors({ email: emailResult.error.issues[0].message });
            return;
        }

        isSubmittingRef.current = true;
        setSubmitError(null);
        setErrors({});
        setLoading(true);

        try {
            const data = await sendOtp();
            if (data.university) {
                setUniversityName(data.university);
            }
            
            // If already verified with account, skip OTP and go straight to password
            if (data.alreadyVerified && data.hasAccount) {
                setAuthMode('login');
                setStep('password');
                return;
            }
            
            // If already verified but no account, skip OTP and go to password (register)
            if (data.alreadyVerified && !data.hasAccount) {
                setAuthMode('register');
                setStep('password');
                return;
            }
            
            // Otherwise, need OTP verification
            setResendCooldown(60);
            setStep('otp');
            setTimeout(() => otpInputRef.current?.focus(), 100);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleOtpSubmit = async () => {
        if (otp.length !== 6) {
            setErrors({ otp: 'Enter the 6-digit code' });
            return;
        }

        isSubmittingRef.current = true;
        setSubmitError(null);
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp }),
            });
            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.error || 'Verification failed');
                return;
            }

            if (data.linked) {
                // Account already linked successfully (user was logged in)
                router.replace('/dashboard');
                return;
            }

            if (data.hasAccount) {
                setAuthMode('login');
                setStep('password');
            } else {
                setAuthMode('register');
                setStep('password');
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setSubmitError(null);
        try {
            await sendOtp();
            setResendCooldown(60);
            setOtp('');
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to resend');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async () => {
        const passResult = loginPasswordSchema.safeParse({ password });
        if (!passResult.success) {
            setErrors({ password: passResult.error.issues[0].message });
            return;
        }

        isSubmittingRef.current = true;
        setSubmitError(null);
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.error || 'Login failed');
                return;
            }

            // If accounts were linked (edu mode), redirect to dashboard
            if (data.linked) {
                router.replace('/dashboard');
                return;
            }

            router.replace('/dashboard');
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handlePasswordSubmit = async () => {
        const passResult = passwordSchema.safeParse({ password, confirmPassword });

        if (!passResult.success) {
            const newErrors: FormErrors = {};
            passResult.error.issues.forEach(i => {
                newErrors[i.path[0] as keyof FormErrors] = i.message;
            });
            setErrors(newErrors);
            return;
        }

        setStep('profile');
    };

    const handleProfileSubmit = async () => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.telephone.trim() || !/^\+20\d{10}$/.test(formData.telephone)) {
            newErrors.telephone = 'Valid phone number is required (+20xxxxxxxxxx)';
        }
        if (!formData.faculty) newErrors.faculty = 'Faculty is required';
        if (!formData.studentId.trim()) {
            newErrors.studentId = 'Student ID is required';
        }
        if (formData.nationalId && formData.nationalId.length !== 14) {
            newErrors.nationalId = 'National ID must be 14 digits';
        }
        if (!formData.studentLevel) newErrors.studentLevel = 'Level is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        isSubmittingRef.current = true;
        setSubmitError(null);
        setErrors({});
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name: formData.name,
                    telephone: formData.telephone,
                    faculty: formData.faculty,
                    studentId: formData.studentId,
                    nationalId: formData.nationalId || undefined,
                    studentLevel: formData.studentLevel,
                    codeforcesProfile: formData.codeforcesProfile || undefined,
                    leetcodeProfile: formData.leetcodeProfile || undefined,
                }),
            });

            const text = await res.text();
            let data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                console.error('Failed to parse response:', text);
                throw new Error('Server error. Please try again.');
            }

            if (!res.ok) {
                setSubmitError(data.error || 'Registration failed');
                return;
            }

            router.replace('/dashboard');
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || isSubmittingRef.current) return;
        
        if (step === 'email') await handleEmailSubmit();
        else if (step === 'otp') await handleOtpSubmit();
        else if (step === 'password') {
            if (authMode === 'login') await handleLoginSubmit();
            else await handlePasswordSubmit();
        }
        else if (step === 'profile') await handleProfileSubmit();
    };

    const handleBack = () => {
        setSubmitError(null);
        setErrors({});
        if (step === 'otp') {
            setStep('email');
            setOtp('');
        } else if (step === 'password') {
            setStep('email');
            setPassword('');
            setConfirmPassword('');
        } else if (step === 'profile') {
            setStep('password');
        }
    };

    const getStrength = (pwd: string) => {
        if (!pwd) return { pct: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 9) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score < 3) return { pct: 30, label: 'Weak', color: 'bg-red-500' };
        if (score < 4) return { pct: 60, label: 'Good', color: 'bg-yellow-500' };
        if (score < 5) return { pct: 80, label: 'Strong', color: 'bg-green-400' };
        return { pct: 100, label: 'Very Strong', color: 'bg-green-500' };
    };

    const strength = getStrength(password);

    const inputBase = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all';
    const inputError = 'border-red-500/50 focus:border-red-500/50';

    const getTitle = () => {
        if (step === 'email') return 'Sign in to Verdict';
        if (step === 'otp') return 'Check your email';
        if (step === 'password' && authMode === 'login') return 'Welcome back';
        if (step === 'password') return 'Create password';
        return 'Complete profile';
    };

    const getSubtitle = () => {
        if (step === 'email') {
            return isEduMode 
                ? 'Put your .edu.eg for your college or institute' 
                : 'Use OAuth or your university email';
        }
        if (step === 'otp') return `We sent a code to ${email}`;
        if (step === 'password' && authMode === 'login') return 'Enter your password';
        if (step === 'password') return 'Choose a secure password';
        return 'Tell us about yourself';
    };

    const getButtonText = () => {
        if (step === 'email') return 'Continue';
        if (step === 'otp') return 'Verify';
        if (step === 'password' && authMode === 'login') return 'Sign in';
        if (step === 'password') return 'Continue';
        return 'Create account';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-16 relative">
                {/* Logo */}
                <div className="absolute top-8 left-8">
                    <Link href="/" className="flex items-center gap-2 text-emerald-500 font-bold text-xl">
                        <Image src="/icons/logo.svg" alt="Verdict" width={28} height={28} />
                        Verdict
                    </Link>
                </div>

                {/* Quote */}
                <div className="max-w-lg">
                    <blockquote className="text-4xl text-white/90 font-medium leading-tight mb-8">
                        "Master algorithms, compete with the best, and represent your university in the <span className="text-emerald-500">ICPC World Finals</span>."
                    </blockquote>
                    <div>
                        <p className="text-white/60 font-medium">Egypt's ICPC Training Hub</p>
                        <p className="text-white/30 text-sm">64 Universities · One Platform</p>
                    </div>
                </div>

                {/* Footer */}
                <p className="absolute bottom-8 left-8 text-white/20 text-xs">© 2026 Verdict</p>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0d0d0d]">
                <div className="w-full max-w-[400px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2 text-emerald-500 font-bold text-xl">
                            <Image src="/icons/logo.svg" alt="Verdict" width={28} height={28} />
                            Verdict
                        </Link>
                    </div>

                    {/* Back button */}
                    {step !== 'email' && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mb-6 text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    )}

                    {/* University badge */}
                    {universityName && step !== 'email' && (
                        <div className="mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg inline-flex items-center gap-2">
                            <Image src="/icons/logo.svg" alt="" width={14} height={14} />
                            <span className="text-emerald-500 text-xs font-medium">{universityName}</span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white mb-1">{getTitle()}</h1>
                    <p className="text-white/50 text-sm mb-8">{getSubtitle()}</p>

                    {/* Error */}
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {submitError}
                        </div>
                    )}

                    {/* Email Step */}
                    {step === 'email' && (
                        <div className="space-y-6">
                            {!isEduMode && (
                                <>
                                    {/* OAuth buttons */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleOAuthLogin('google')}
                                                disabled={oauthLoading !== null}
                                                className="py-2.5 px-4 bg-white text-gray-800 text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            >
                                                {oauthLoading === 'google' ? <Loader2 className="animate-spin" size={18} /> : <><GoogleIcon /> Google</>}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleOAuthLogin('github')}
                                                disabled={oauthLoading !== null}
                                                className="py-2.5 px-4 bg-[#24292F] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#32383F] transition-colors disabled:opacity-50"
                                            >
                                                {oauthLoading === 'github' ? <Loader2 className="animate-spin" size={18} /> : <><Github size={18} /> GitHub</>}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleOAuthLogin('codeforces')}
                                            className="py-2.5 px-4 bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" className="brightness-125">
                                                <rect width="4" height="12" x="1" y="11" fill="#4B89D4" rx="1" />
                                                <rect width="4" height="20" x="8" y="3" fill="#4B89D4" rx="1" />
                                                <rect width="4" height="15" x="15" y="8" fill="#4B89D4" rx="1" />
                                            </svg>
                                            Continue with Codeforces
                                        </button>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 bg-[#0d0d0d] text-white/30 text-xs">or</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Email input */}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="University Email (.edu.eg)"
                                        className={cn(inputBase, errors.email && inputError)}
                                        autoFocus
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                ref={otpInputRef}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined })); }}
                                placeholder="000000"
                                className={cn(inputBase, 'text-center text-xl tracking-[0.3em] font-mono', errors.otp && inputError)}
                                autoComplete="one-time-code"
                            />
                            {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
                            
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/30">Check spam folder</span>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0 || loading}
                                    className="text-emerald-500 hover:text-emerald-400 disabled:text-white/20 font-medium"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Password Step - Login */}
                    {step === 'password' && authMode === 'login' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                                    placeholder="Password"
                                    className={cn(inputBase, 'pr-10', errors.password && inputError)}
                                    autoFocus
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Password Step - Register */}
                    {step === 'password' && authMode === 'register' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                                        placeholder="Password"
                                        className={cn(inputBase, 'pr-10', errors.password && inputError)}
                                        autoFocus
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                {password && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 bg-white/10 rounded-full h-1">
                                            <div className={cn('h-1 rounded-full transition-all', strength.color)} style={{ width: strength.pct + '%' }} />
                                        </div>
                                        <span className="text-xs text-white/40">{strength.label}</span>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                                    placeholder="Confirm password"
                                    className={cn(inputBase, 'pr-10', errors.confirmPassword && inputError)}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Profile Step */}
                    {step === 'profile' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Full name"
                                    className={cn(inputBase, errors.name && inputError)}
                                    autoFocus
                                />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleFormChange}
                                        placeholder="Phone"
                                        className={cn(inputBase, errors.telephone && inputError)}
                                    />
                                    {errors.telephone && <p className="text-red-400 text-xs mt-1">{errors.telephone}</p>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleFormChange}
                                        placeholder="Student ID"
                                        className={cn(inputBase, errors.studentId && inputError)}
                                    />
                                    {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <CustomDropdown
                                    value={formData.faculty}
                                    onChange={(v) => handleDropdownChange('faculty', v)}
                                    options={facultyOptions}
                                    placeholder="Faculty"
                                    error={errors.faculty}
                                />
                                <CustomDropdown
                                    value={formData.studentLevel}
                                    onChange={(v) => handleDropdownChange('studentLevel', v)}
                                    options={levelOptions}
                                    placeholder="Level"
                                    error={errors.studentLevel}
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    name="codeforcesProfile"
                                    value={formData.codeforcesProfile}
                                    onChange={handleFormChange}
                                    placeholder="Codeforces handle (optional)"
                                    className={inputBase}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <CheckCircle2 size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <p className="text-center text-white/20 text-xs mt-8">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-white/40">Terms</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="underline hover:text-white/40">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function UniversityAuth() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        }>
            <UniversityAuthContent />
        </Suspense>
    );
}
