'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Building2, Users, Trophy, Bell, Pin, ChevronRight, ChevronLeft,
    Calendar, Crown, Medal, ExternalLink, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Room {
    id: number;
    slug: string;
    description: string;
    bannerUrl: string | null;
    university: {
        id: number;
        name: string;
        shortName: string;
        logoUrl: string | null;
        emailDomain: string;
        memberCount: number;
        totalSolves: number;
        type: string;
    };
}

interface Announcement {
    id: number;
    title: string;
    body: string;
    pinned: boolean;
    createdAt: string;
    authorName: string;
}

interface Member {
    id: number;
    name: string;
    username: string;
    solvedCount: number;
    rank: number;
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [topMembers, setTopMembers] = useState<Member[]>([]);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'announcements' | 'leaderboard'>('announcements');

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/rooms/${resolvedParams.roomId}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setRoom(data.room);
                    setAnnouncements(data.announcements || []);
                    setTopMembers(data.topMembers || []);
                    setIsMember(data.isMember || false);
                }
            } catch (error) {
                console.error('Failed to fetch room:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [resolvedParams.roomId]);

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get rank badge color
    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-emerald-400';
        if (rank === 2) return 'text-gray-300';
        if (rank === 3) return 'text-emerald-600';
        return 'text-[#666]';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={16} className="text-emerald-400" />;
        if (rank === 2) return <Medal size={16} className="text-gray-300" />;
        if (rank === 3) return <Medal size={16} className="text-emerald-600" />;
        return null;
    };

    // Skeleton loader
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-64 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/40">Room not found</p>
                <Link href="/dashboard/rooms" className="text-emerald-400 text-sm mt-2 hover:underline">
                    Back to Rooms
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => router.push('/dashboard/rooms')}
                className="flex items-center gap-2 text-sm text-[#808080] hover:text-white transition-colors"
            >
                <ChevronLeft size={16} />
                Back to Rooms
            </button>

            {/* Room Header */}
            <div className="relative rounded-2xl overflow-hidden">
                {/* Banner */}
                <div className="h-32 md:h-40 bg-gradient-to-br from-purple-500/30 via-emerald-500/20 to-blue-500/30 relative">
                    {room.bannerUrl && (
                        <img
                            src={room.bannerUrl}
                            alt={room.university.name}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

                    {/* University type badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-medium text-white/80 capitalize">
                        {room.university.type} University
                    </div>
                </div>

                {/* Room info */}
                <div className="bg-[#0f0f0f] border border-white/10 border-t-0 rounded-b-2xl p-6 relative">
                    {/* University logo/avatar */}
                    <div className="absolute -top-10 left-6">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border-4 border-[#0f0f0f] flex items-center justify-center text-3xl font-bold text-white/80 shadow-xl">
                            {room.university.logoUrl ? (
                                <img src={room.university.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                room.university.shortName.substring(0, 2)
                            )}
                        </div>
                    </div>

                    <div className="ml-0 md:ml-24 pt-8 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    {room.university.name}
                                </h1>
                                <p className="text-[#808080] text-sm mt-1 flex items-center gap-2">
                                    <span>{room.university.shortName}</span>
                                    <span className="text-[#444]">•</span>
                                    <span className="text-emerald-400/80">@{room.university.emailDomain}</span>
                                </p>
                            </div>

                            {isMember && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-medium text-emerald-400">Member</span>
                                </div>
                            )}
                        </div>

                        {room.description && (
                            <p className="text-[#A0A0A0] text-sm mt-4 max-w-2xl">
                                {room.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Users size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{room.university.memberCount}</p>
                                    <p className="text-[10px] text-[#666] uppercase tracking-wider">Members</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Trophy size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{room.university.totalSolves}</p>
                                    <p className="text-[10px] text-[#666] uppercase tracking-wider">Total Solves</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content area */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tab buttons */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('announcements')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === 'announcements'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-[#808080] hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Bell size={16} />
                                Announcements
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === 'leaderboard'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-[#808080] hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Trophy size={16} />
                                Leaderboard
                            </div>
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'announcements' ? (
                        <div className="space-y-4">
                            {announcements.length === 0 ? (
                                <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-8 text-center">
                                    <Bell size={32} className="mx-auto text-white/20 mb-3" />
                                    <p className="text-white/40">No announcements yet</p>
                                    <p className="text-white/20 text-sm mt-1">
                                        Check back later for updates from your university
                                    </p>
                                </div>
                            ) : (
                                announcements.map((announcement) => (
                                    <motion.div
                                        key={announcement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`bg-[#0f0f0f] border rounded-xl p-5 ${
                                            announcement.pinned
                                                ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent'
                                                : 'border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {announcement.pinned && (
                                                        <Pin size={14} className="text-emerald-400" />
                                                    )}
                                                    <h3 className="font-bold text-white">
                                                        {announcement.title}
                                                    </h3>
                                                </div>
                                                <p className="text-[#A0A0A0] text-sm mt-2 whitespace-pre-line">
                                                    {announcement.body}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3 text-xs text-[#666]">
                                                    <span>{announcement.authorName}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {formatRelativeTime(announcement.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="font-bold text-white">University Leaderboard</h3>
                                <p className="text-xs text-[#666] mt-1">Top performers from {room.university.shortName}</p>
                            </div>
                            <div className="divide-y divide-white/5">
                                {topMembers.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Trophy size={32} className="mx-auto text-white/20 mb-3" />
                                        <p className="text-white/40">No members on the leaderboard yet</p>
                                    </div>
                                ) : (
                                    topMembers.map((member, index) => (
                                        <Link
                                            key={member.id}
                                            href={`/profile/${member.username || member.id}`}
                                            className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className={`w-8 text-center font-bold ${getRankColor(member.rank)}`}>
                                                {getRankIcon(member.rank) || `#${member.rank}`}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{member.name}</p>
                                                <p className="text-xs text-[#666]">@{member.username}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-400">{member.solvedCount}</p>
                                                <p className="text-[10px] text-[#666]">solved</p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                            <div className="p-3 border-t border-white/10 bg-white/5">
                                <Link
                                    href={`/dashboard/leaderboard?scope=university`}
                                    className="flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                                >
                                    View Full Leaderboard
                                    <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Quick stats card */}
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[#808080] text-sm">Active Members</span>
                                <span className="font-bold text-white">{room.university.memberCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#808080] text-sm">Total Solves</span>
                                <span className="font-bold text-emerald-400">{room.university.totalSolves}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#808080] text-sm">Avg. per Member</span>
                                <span className="font-bold text-white">
                                    {room.university.memberCount > 0
                                        ? Math.round(room.university.totalSolves / room.university.memberCount)
                                        : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#808080] text-sm">Announcements</span>
                                <span className="font-bold text-white">{announcements.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Join CTA (if not member) */}
                    {!isMember && (
                        <div className="bg-gradient-to-br from-purple-500/10 to-emerald-500/10 border border-white/10 rounded-xl p-5">
                            <h3 className="font-bold text-white mb-2">Join This Room</h3>
                            <p className="text-[#808080] text-sm mb-4">
                                Verify your <span className="text-emerald-400">@{room.university.emailDomain}</span> email
                                to join this room and compete with your peers.
                            </p>
                            <Link
                                href="/dashboard/profile"
                                className="block w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-sm rounded-lg text-center transition-colors"
                            >
                                Verify Email
                            </Link>
                        </div>
                    )}

                    {/* Top 3 members highlight */}
                    {topMembers.length >= 3 && (
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Crown size={16} className="text-emerald-400" />
                                Top Performers
                            </h3>
                            <div className="space-y-3">
                                {topMembers.slice(0, 3).map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg ${
                                            index === 0 ? 'bg-emerald-500/10' : ''
                                        }`}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {getRankIcon(index + 1)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {member.name}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-400">
                                            {member.solvedCount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
