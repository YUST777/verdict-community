'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    User, Trophy, Flame, Calendar, ExternalLink, Building2,
    CheckCircle2, ArrowLeft, BookOpen, TrendingUp
} from 'lucide-react';

interface ProfileData {
    username: string;
    displayName: string;
    profilePicture: string | null;
    codeforcesHandle: string | null;
    codeforcesData: any;
    university: { name: string; shortName: string; slug: string } | null;
    faculty: string | null;
    joinedAt: string;
    stats: {
        solvedCount: number;
        totalSubmissions: number;
        currentStreak: number;
        longestStreak: number;
        nationalRank: number | null;
        universityRank: number | null;
    };
    achievements: { id: string; earnedAt: string }[];
}

export default function PublicProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/user/public-profile?username=${encodeURIComponent(username)}`);
                if (res.status === 404) {
                    setError('User not found');
                    return;
                }
                if (res.status === 403) {
                    setError('This profile is private');
                    return;
                }
                if (!res.ok) {
                    setError('Failed to load profile');
                    return;
                }
                const data = await res.json();
                setProfile(data.profile);
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
                    <div className="h-32 bg-white/5 rounded-2xl" />
                    <div className="h-48 bg-white/5 rounded-2xl" />
                    <div className="h-24 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <User size={48} className="mx-auto text-white/20 mb-4" />
                    <h1 className="text-xl font-bold text-white mb-2">{error || 'User not found'}</h1>
                    <Link href="/" className="text-emerald-400 text-sm hover:underline flex items-center gap-1 justify-center mt-4">
                        <ArrowLeft size={14} /> Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const cfRating = profile.codeforcesData?.rating;
    const cfRank = profile.codeforcesData?.rank;

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Nav */}
            <nav className="border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-emerald-500 font-bold text-lg">Verdict</Link>
                    <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
                        Dashboard
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Profile header */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
                    <div className="flex items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl font-bold text-white/60 shrink-0 overflow-hidden">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                profile.displayName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-white truncate">{profile.displayName}</h1>
                            <p className="text-[#808080] text-sm">@{profile.username}</p>

                            {profile.university && (
                                <Link
                                    href={`/dashboard/rooms/${profile.university.slug}`}
                                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-colors"
                                >
                                    <Building2 size={12} />
                                    {profile.university.name}
                                    {profile.faculty && <span className="text-purple-400/60">· {profile.faculty}</span>}
                                </Link>
                            )}

                            {profile.codeforcesHandle && (
                                <a
                                    href={`https://codeforces.com/profile/${profile.codeforcesHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2 ml-2 text-xs text-[#808080] hover:text-emerald-400 transition-colors"
                                >
                                    CF: {profile.codeforcesHandle}
                                    {cfRating && <span className="font-bold">({cfRating})</span>}
                                    <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Problems Solved', value: profile.stats.solvedCount, icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
                        { label: 'Current Streak', value: `${profile.stats.currentStreak}d`, icon: <Flame size={18} className="text-orange-400" /> },
                        { label: 'National Rank', value: profile.stats.nationalRank ? `#${profile.stats.nationalRank}` : '—', icon: <TrendingUp size={18} className="text-blue-400" /> },
                        { label: 'University Rank', value: profile.stats.universityRank ? `#${profile.stats.universityRank}` : '—', icon: <Building2 size={18} className="text-purple-400" /> },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#111] rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-[10px] text-[#666] uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Achievements */}
                {profile.achievements.length > 0 && (
                    <div className="bg-[#111] rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy size={18} className="text-amber-400" />
                            Achievements
                            <span className="text-xs text-[#666] font-normal ml-1">{profile.achievements.length} earned</span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.achievements.map(a => (
                                <div
                                    key={a.id}
                                    className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium"
                                >
                                    {a.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Member since */}
                <div className="text-center text-[#555] text-xs py-4">
                    <Calendar size={12} className="inline mr-1" />
                    Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
            </div>
        </div>
    );
}
