'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Trophy, LineChart, Bot, Users, Loader2 } from 'lucide-react';
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
            
            const res = await fetch('/api/user/edu-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: isStudent ? 'pending' : 'declined' })
            });

            if (res.ok) {
                if (isStudent) {
                    // Redirect to registration/verification flow with edu mode
                    router.push('/register?mode=edu');
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
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            {/* Dialog Overlay */}
            <div
                onClick={() => handleAction(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500"
            />

            {/* Dialog Content */}
            <div className="relative flex max-h-[calc(100%-2rem)] w-full flex-col overflow-hidden border border-white/10 bg-[#121212]/90 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 sm:max-w-[440px] rounded-[2.5rem] ring-1 ring-white/5">
                
                {/* Video Banner */}
                <div className="relative h-40 w-full shrink-0 bg-black overflow-hidden">
                    <video
                        src="/video.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover opacity-60 scale-105"
                    />
                    {/* Gradient overlay to blend video into the background smoothly */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/20 to-transparent" />
                </div>

                {/* Main Content Wrapper */}
                <div className="flex-1 overflow-y-auto px-8 pb-10 pt-4">
                    
                    {/* Dialog Header & Features Combined */}
                    <div className="flex flex-col space-y-6 text-center">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Member Exclusive</span>
                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                Are you a student in Egypt?
                            </h2>
                        </div>
                        
                        <p className="text-[15px] text-zinc-400 leading-[1.8] font-medium">
                            Unlock your full potential in competitive programming with exclusive ECPC training benefits.
                            Unlock access to <span className="text-white decoration-zinc-500 underline underline-offset-4">+650 curated problems</span>, 
                            private <span className="text-white decoration-zinc-500 underline underline-offset-4">leaderboard rooms</span>, 
                            and <span className="text-white decoration-zinc-500 underline underline-offset-4">progress monitoring</span>—plus 
                            your own <span className="text-white decoration-zinc-500 underline underline-offset-4">free personalized AI tutor</span>.
                        </p>
                    </div>

                    {/* Dialog Footer */}
                    <div className="mt-10 flex flex-col items-center gap-6">
                        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAction(false)}
                                disabled={loading}
                                className="inline-flex h-14 items-center justify-center rounded-2xl text-[15px] font-semibold transition-all hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-50"
                            >
                                Not a student
                            </button>
                            <button
                                onClick={() => handleAction(true)}
                                disabled={loading}
                                className="relative group inline-flex h-14 items-center justify-center rounded-2xl text-[15px] font-bold transition-all bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <span className="relative z-10">Yes, I am!</span>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white via-white to-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium tracking-wide">
                            Settings can be updated later in your profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

