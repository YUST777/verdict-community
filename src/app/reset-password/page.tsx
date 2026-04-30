'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

function ResetForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords don't match"); return; }
        if (password.length < 9) { setError('Password must be at least 9 characters'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed'); return; }
            setDone(true);
            setTimeout(() => router.replace('/dashboard'), 2000);
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-400 mb-4">Invalid or missing reset token.</p>
                <Link href="/forgot-password" className="text-emerald-400 hover:underline">Request a new link</Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Password reset!</h1>
                <p className="text-white/50 text-sm">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-1">New password</h1>
            <p className="text-white/50 text-sm mb-8">Choose a strong password</p>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50 pr-10" autoFocus />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-emerald-500/50" />
                <button type="submit" disabled={loading || !password || !confirm} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Reset password'}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
            <div className="w-full max-w-[400px]">
                <Link href="/" className="flex items-center gap-2 text-emerald-500 font-bold text-xl mb-8">
                    <Image src="/icons/logo.svg" alt="Verdict" width={28} height={28} />
                    Verdict
                </Link>
                <Suspense fallback={<div className="text-white/40">Loading...</div>}>
                    <ResetForm />
                </Suspense>
            </div>
        </div>
    );
}
