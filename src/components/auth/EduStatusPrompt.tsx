'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EduStatusPrompt() {
    const { user, isAuthenticated, refreshSession } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only show if authenticated and status is 'pending'
        if (isAuthenticated && user?.edu_eg_status === 'pending') {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isAuthenticated, user?.edu_eg_status]);

    if (!isVisible) return null;

    const handleAction = async (isStudent: boolean) => {
        try {
            setLoading(true);
            const status = isStudent ? 'pending_verification' : 'declined';
            
            const res = await fetch('/api/user/edu-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: isStudent ? 'pending' : 'declined' })
            });

            if (res.ok) {
                if (isStudent) {
                    // Redirect to registration/verification flow
                    router.push('/register');
                    setIsVisible(false);
                } else {
                    // Just close and refresh
                    await refreshSession();
                    setIsVisible(false);
                }
            }
        } catch (error) {
            console.error('Failed to update edu status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={() => handleAction(false)} // Safe fallback to close
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
                
                <div className="p-8 pt-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                            <GraduationCap className="text-emerald-400" size={32} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Are you a student in Egypt?
                        </h2>
                        <p className="text-white/60 mb-8 max-w-sm">
                            Unlock ECPC training with <span className="text-emerald-400 font-semibold">+650 problems</span>, private leaderboard rooms, monitoring, and exclusive rewards.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            <button
                                onClick={() => handleAction(true)}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Yes, I am! <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleAction(false)}
                                disabled={loading}
                                className="flex items-center justify-center px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/5 transition-all disabled:opacity-50"
                            >
                                Not a student
                            </button>
                        </div>

                        <p className="mt-6 text-xs text-white/30 italic">
                            You can always update this later in your profile settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
