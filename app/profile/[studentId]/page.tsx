'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ChevronLeft, Trophy, Zap, Code, ExternalLink, Shield, Calendar, Lock, Loader2, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayName } from '@/lib/utils';

const Badge3D = dynamic(() => import('@/components/Badge3D'), { ssr: false });

const achievementModels: Record<string, string> = {
    // welcome: '/3d/WELCOME.glb',
    // approval: '/3d/done_approvalcamp.glb',
    // '500pts': '/3d/500pts.glb',
    // instructor: '/3d/instructor.glb',
};

const achievementImages: Record<string, string> = {
    welcome: '/images/achievements/WELCOME.webp',
    approval: '/images/achievements/done_approvalcamp.webp',
    '500pts': '/images/achievements/500pts.webp',
    instructor: '/images/achievements/instructor.webp',
};

interface Profile {
    name: string;
    role: string;
    faculty: string;
    studentLevel: string;
    joinedAt: string;
    codeforces?: {
        rating?: number;
        maxRating?: number;
        totalSolved?: number;
        rank?: string;
        profile?: string;
    };
    leetcode?: { profile?: string };
    telegram?: { username?: string };
    achievementsCount: number;
    achievements?: { id: string; name: string; unlocked: boolean; rarity: string }[];
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const studentId = params?.studentId as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            router.replace(`/dashboard/profile/${studentId}`);
        }
    }, [user, authLoading, studentId, router]);

    useEffect(() => {
        if (!studentId) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile/${studentId}`);
                const data = await res.json();
                if (!res.ok) { setError(data.error || 'Profile not found'); return; }
                setProfile(data.profile);
            } catch { setError('Failed to load profile'); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [studentId]);

    if (authLoading || loading) {
        return <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#10B981] animate-spin" /></div>;
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center text-white px-6">
                <Lock className="w-16 h-16 text-gray-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{error || 'Profile Not Found'}</h1>
                <p className="text-gray-400 mb-6">This profile may be private or doesn&apos;t exist.</p>
                <Link href="/" className="px-6 py-2 bg-[#10B981] text-black font-bold rounded-lg hover:bg-[#059669]">Go Home</Link>
            </div>
        );
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner': return { text: 'Owner', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
            case 'instructor': return { text: 'Instructor', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
            default: return { text: 'Trainee', color: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' };
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'border-[#10B981]/50 shadow-[0_0_20px_rgba(232,193,90,0.3)]';
            case 'rare': return 'border-blue-500/40';
            default: return 'border-white/10';
        }
    };

    const roleBadge = getRoleBadge(profile.role);
    const cfData = profile.codeforces || {};
    const rating = cfData.rating || 'N/A';
    const maxRating = cfData.maxRating || 'N/A';
    const rank = cfData.rank || 'Unrated';
    const totalSolved = cfData.totalSolved || 0;

    const rarityOrder: Record<string, number> = { legendary: 3, rare: 2, common: 1 };
    const sortedAchievements = [...(profile.achievements || [])].sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    });

    return (
        <div className="min-h-screen bg-[#0B0B0C] text-white">
            {/* Header */}
            <header className="p-4 md:p-6 flex items-center gap-4 border-b border-white/10 bg-[#121212]">
                <Link href="/" className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-[#10B981]">Public Profile</h1>
                    <p className="text-xs md:text-sm text-gray-500">ID: {studentId}</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                {/* Identity Card */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-colors">
                    {/* Decorative Cover */}
                    <div className="h-28 md:h-32 bg-gradient-to-r from-[#10B981]/20 via-[#047857]/10 to-transparent relative">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
                        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                            <Shield size={12} className="text-[#10B981]" />
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${roleBadge.color.split(' ')[1]}`}>{roleBadge.text}</span>
                        </div>
                    </div>

                    {/* Avatar & Info */}
                    <div className="px-4 md:px-6 pb-6 -mt-12 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-2xl bg-[#121212] p-1.5 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-3xl font-bold text-black overflow-hidden relative">
                                    {profile.telegram?.username ? (
                                        <img
                                            src={`https://unavatar.io/telegram/${profile.telegram.username}`}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : null}
                                    <span className={`${profile.telegram?.username ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>

                            {/* Name & Details */}
                            <div className="flex-1">
                                <h2 className="text-2xl md:text-3xl font-bold text-[#F2F2F2] tracking-tight">{getDisplayName(profile.name) || 'Member'}</h2>
                                <p className="text-sm text-[#666] font-mono mt-1">@{studentId}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#A0A0A0]">
                                    {profile.faculty && <span className="flex items-center gap-1"><Award size={12} />{profile.faculty}</span>}
                                    {profile.studentLevel && <span>Level {profile.studentLevel}</span>}
                                    {profile.joinedAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            Joined {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <StatCard label="CF Rating" value={rating} accent />
                    <StatCard label="Max Rating" value={maxRating} />
                    <StatCard label="Problems Solved" value={totalSolved} />
                    <StatCard label="Badges" value={`${profile.achievementsCount}/4`} />
                </div>

                {/* Competitive Programming Links */}
                {(cfData.profile || profile.leetcode?.profile) && (
                    <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 md:p-5">
                        <h3 className="text-sm text-[#A0A0A0] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Code size={14} className="text-[#10B981]" />
                            Competitive Programming
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {cfData.profile && (
                                <a href={`https://codeforces.com/profile/${cfData.profile}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-white/5 hover:border-[#10B981]/30 hover:bg-[#1A1A1A]/80 transition-all group">
                                    <div className="p-2.5 bg-[#10B981]/10 rounded-lg text-[#10B981] group-hover:scale-110 transition-transform">
                                        <Zap size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-[#F2F2F2]">Codeforces</div>
                                        <div className="text-sm text-[#666] capitalize">{rank}</div>
                                    </div>
                                    <ExternalLink size={16} className="text-[#666] group-hover:text-[#10B981] transition-colors" />
                                </a>
                            )}
                            {profile.leetcode?.profile && (
                                <a href={`https://leetcode.com/${profile.leetcode.profile}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-white/5 hover:border-orange-500/30 hover:bg-[#1A1A1A]/80 transition-all group">
                                    <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-400 group-hover:scale-110 transition-transform">
                                        <Code size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-[#F2F2F2]">LeetCode</div>
                                        <div className="text-sm text-[#666]">View Profile</div>
                                    </div>
                                    <ExternalLink size={16} className="text-[#666] group-hover:text-orange-400 transition-colors" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 md:p-6">
                    <h3 className="text-sm text-[#A0A0A0] uppercase tracking-wider mb-5 flex items-center gap-2">
                        <Trophy size={14} className="text-[#10B981]" />
                        Achievements ({profile.achievementsCount}/4)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {sortedAchievements.map((ach) => (
                            <div
                                key={ach.id}
                                className={`relative bg-[#0f0f0f] rounded-xl border overflow-hidden transition-all duration-300 ${ach.unlocked ? getRarityColor(ach.rarity) : 'border-white/5 opacity-50 grayscale'}`}
                            >
                                <div className={`h-28 md:h-32 relative ${!ach.unlocked ? 'blur-[2px]' : ''}`}>
                                    {ach.unlocked && achievementModels[ach.id] ? (
                                        <Badge3D modelPath={achievementModels[ach.id]} unlocked scale={1.3} />
                                    ) : achievementImages[ach.id] ? (
                                        <img src={achievementImages[ach.id]} alt={ach.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                            <Lock className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                {!ach.unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <Lock className="w-6 h-6 text-white/40" />
                                    </div>
                                )}
                                <div className="p-3 text-center border-t border-white/5 bg-[#0a0a0a]">
                                    <div className={`text-sm font-medium truncate ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>{ach.name}</div>
                                    <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${ach.rarity === 'legendary' ? 'text-[#10B981]' : ach.rarity === 'rare' ? 'text-blue-400' : 'text-gray-600'
                                        }`}>{ach.rarity}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }`}</style>
        </div>
    );
}

function StatCard({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
    return (
        <div className="bg-[#121212] p-4 md:p-5 rounded-xl border border-white/5 text-center hover:border-white/10 transition-colors group">
            <div className={`text-xl md:text-2xl font-bold ${accent ? 'text-[#10B981]' : 'text-white'} group-hover:scale-105 transition-transform`}>{value}</div>
            <div className="text-[10px] md:text-xs uppercase tracking-wider text-[#666] mt-1">{label}</div>
        </div>
    );
}
