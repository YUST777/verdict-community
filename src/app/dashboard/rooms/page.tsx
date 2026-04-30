'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Building2, Trophy, ChevronRight, Search, Loader2, Star, Bell } from 'lucide-react';

interface Room {
    id: number;
    slug: string;
    description: string;
    bannerUrl: string | null;
    isActive: boolean;
    university: {
        id: number;
        name: string;
        shortName: string;
        logoUrl: string | null;
        memberCount: number;
        totalSolves: number;
    };
    announcementCount: number;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userUniversityId, setUserUniversityId] = useState<number | null>(null);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/rooms', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data.rooms || []);
                    setFilteredRooms(data.rooms || []);
                    setUserUniversityId(data.userUniversityId || null);
                }
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Filter rooms based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRooms(rooms);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = rooms.filter(
            (room) =>
                room.university.name.toLowerCase().includes(query) ||
                room.university.shortName.toLowerCase().includes(query) ||
                room.slug.toLowerCase().includes(query)
        );
        setFilteredRooms(filtered);
    }, [searchQuery, rooms]);

    // Get user's room (if any)
    const myRoom = rooms.find((r) => r.university.id === userUniversityId);

    // Skeleton loader
    if (loading) {
        return (
            <div className="space-y-8">
                <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-white/5 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-white/5" />
                        <div className="space-y-2">
                            <div className="h-8 w-56 rounded-lg bg-white/5" />
                            <div className="h-4 w-72 rounded bg-white/5" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                        <Building2 className="text-purple-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">University Rooms</h1>
                        <p className="text-[#A0A0A0] text-sm mt-1">
                            Connect with students from your university and compete together
                        </p>
                    </div>
                </div>
                <p className="text-[#808080] text-sm leading-relaxed max-w-2xl">
                    Each Egyptian university has its own training room. Join your university's room to access
                    announcements, compete in university leaderboards, and collaborate with fellow students.
                </p>
            </div>

            {/* My Room Card (if user has a university) */}
            {myRoom && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-[#F2F2F2] flex items-center gap-2">
                        <Star size={18} className="text-emerald-400" />
                        My University Room
                    </h2>
                    <Link href={`/dashboard/rooms/${myRoom.slug}`} className="block group">
                        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-emerald-500/50 via-purple-500/50 to-blue-500/50 overflow-hidden">
                            <div className="bg-[#0f0f0f] rounded-[15px] p-6 relative overflow-hidden">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold text-white/80">
                                            {myRoom.university.shortName.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {myRoom.university.name}
                                            </h3>
                                            <p className="text-sm text-[#808080]">{myRoom.university.shortName}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-colors" />
                                </div>

                                <div className="flex items-center gap-6 mt-4 relative z-10">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users size={16} className="text-emerald-400" />
                                        <span className="text-white/80">{myRoom.university.memberCount}</span>
                                        <span className="text-[#666]">members</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Trophy size={16} className="text-emerald-400" />
                                        <span className="text-white/80">{myRoom.university.totalSolves}</span>
                                        <span className="text-[#666]">solves</span>
                                    </div>
                                    {myRoom.announcementCount > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Bell size={16} className="text-blue-400" />
                                            <span className="text-white/80">{myRoom.announcementCount}</span>
                                            <span className="text-[#666]">announcements</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F2F2F2]">All University Rooms</h2>
                <div className="relative w-full sm:w-72">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                        type="text"
                        placeholder="Search universities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <Building2 size={48} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white/40">No rooms found</p>
                        {searchQuery && (
                            <p className="text-white/20 text-sm mt-2">Try a different search term</p>
                        )}
                    </div>
                ) : (
                    filteredRooms.map((room) => (
                        <Link
                            key={room.id}
                            href={`/dashboard/rooms/${room.slug}`}
                            className="group"
                        >
                            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden h-full">
                                <div className="bg-[#0f0f0f] rounded-[15px] p-5 h-full flex flex-col relative overflow-hidden group-hover:bg-[#111] transition-colors">
                                    {/* Highlight if it's user's university */}
                                    {room.university.id === userUniversityId && (
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase">
                                            Your University
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70 shrink-0">
                                            {room.university.shortName.substring(0, 2)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                                {room.university.name}
                                            </h3>
                                            <p className="text-xs text-[#666] truncate">{room.university.shortName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-[#808080] mt-auto pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-emerald-400/70" />
                                            <span>{room.university.memberCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Trophy size={14} className="text-emerald-400/70" />
                                            <span>{room.university.totalSolves}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 ml-auto transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Info about joining */}
            {!userUniversityId && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                            <Building2 size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-emerald-400 text-sm">Verify Your University Email</h4>
                            <p className="text-[#A0A0A0] text-xs mt-1">
                                To join your university room and appear on university leaderboards, verify your
                                university email (.edu.eg) in your profile settings.
                            </p>
                            <Link
                                href="/dashboard/profile"
                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Go to Profile
                                <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
