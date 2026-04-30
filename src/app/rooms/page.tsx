'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Trophy, Search, ChevronRight, ArrowLeft } from 'lucide-react';

interface PublicRoom {
    id: number;
    slug: string;
    university: {
        id: number;
        name: string;
        shortName: string;
        type: string;
        memberCount: number;
        totalSolves: number;
    };
}

export default function PublicRoomsPage() {
    const [rooms, setRooms] = useState<PublicRoom[]>([]);
    const [filtered, setFiltered] = useState<PublicRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms/public');
                if (res.ok) {
                    const data = await res.json();
                    setRooms(data.rooms || []);
                    setFiltered(data.rooms || []);
                }
            } catch (err) {
                console.error('Failed to fetch rooms:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        let result = rooms;
        if (typeFilter !== 'all') {
            result = result.filter(r => r.university.type === typeFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(r =>
                r.university.name.toLowerCase().includes(q) ||
                r.university.shortName.toLowerCase().includes(q)
            );
        }
        setFiltered(result);
    }, [search, typeFilter, rooms]);

    const totalMembers = rooms.reduce((sum, r) => sum + r.university.memberCount, 0);
    const totalSolves = rooms.reduce((sum, r) => sum + r.university.totalSolves, 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Nav */}
            <nav className="border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-emerald-500 font-bold text-lg">Verdict</Link>
                    <div className="flex items-center gap-4">
                        <Link href="/register" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                            Join Now
                        </Link>
                        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Hero */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">University Rooms</h1>
                    <p className="text-[#808080] max-w-lg mx-auto">
                        {rooms.length} Egyptian universities training together on Verdict.
                        Find your university and start competing.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-emerald-400" />
                            <span className="text-white font-bold">{totalMembers.toLocaleString()}</span>
                            <span className="text-[#666]">students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy size={16} className="text-emerald-400" />
                            <span className="text-white font-bold">{totalSolves.toLocaleString()}</span>
                            <span className="text-[#666]">problems solved</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'public', 'private', 'civil', 'special'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    typeFilter === t
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-white/5 text-[#808080] border border-white/5 hover:bg-white/10'
                                }`}
                            >
                                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                        <input
                            type="text"
                            placeholder="Search universities..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-[#666] focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Building2 size={48} className="mx-auto text-white/20 mb-4" />
                                <p className="text-white/40">No universities found</p>
                            </div>
                        ) : (
                            filtered.map(room => (
                                <Link key={room.id} href={`/dashboard/rooms/${room.slug}`} className="group">
                                    <div className="bg-[#111] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all h-full flex flex-col">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70 shrink-0">
                                                {room.university.shortName.substring(0, 2)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate text-sm">
                                                    {room.university.name}
                                                </h3>
                                                <p className="text-[10px] text-[#666]">
                                                    {room.university.shortName} · {room.university.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-[#808080] mt-auto pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={12} className="text-emerald-400/70" />
                                                <span>{room.university.memberCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Trophy size={12} className="text-emerald-400/70" />
                                                <span>{room.university.totalSolves}</span>
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-emerald-400 ml-auto transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
