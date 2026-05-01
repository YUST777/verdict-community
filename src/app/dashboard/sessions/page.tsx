'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Folder, Play } from 'lucide-react';
import { camps } from '@/lib/sessionData';

export default function SessionsPage() {
    return (
        <div className="font-sans text-white space-y-8 animate-fade-in pb-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-6 md:p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Play className="text-emerald-400" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#F2F2F2]">Training Sessions</h1>
                        <p className="text-[#A0A0A0] text-sm mt-1">Exclusive Live & Recorded Training Camps</p>
                    </div>
                </div>
                <p className="text-[#808080] text-sm leading-relaxed max-w-2xl">
                    Explore our collection of specialized training sessions and camps.
                    From seasonal workshops to advanced problem-solving intensives, access all materials in one place.
                </p>
            </div>

            <div className="max-w-7xl mx-auto">
                <h2 className="text-lg font-semibold text-[#F2F2F2] mb-4">Available Camps</h2>
                {/* Folder View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {camps.filter(camp => camp.dashboardVisible !== false).map((group) => (
                        <Link
                            key={group.slug}
                            href={`/dashboard/sessions/${group.slug}`}
                            className="group"
                        >
                            <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden h-full">
                                <div className="bg-[#0f0f0f] rounded-[23px] relative overflow-hidden h-full flex flex-col">
                                    <div className="relative h-48 w-full overflow-hidden bg-[#1a1a1a]">
                                        {group.image && (
                                            <Image
                                                src={group.image}
                                                alt={group.title}
                                                fill
                                                className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent flex items-center justify-center">
                                            <Folder className="w-12 h-12 text-white/20 group-hover:text-emerald-400 transition-colors relative z-10" />
                                        </div>
                                    </div>

                                    <div className="relative z-10 p-5 pt-4 mt-auto">
                                        <div className="mb-3">
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {group.title}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {group.sessions.length} Session{group.sessions.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <p className="text-sm text-[#808080] line-clamp-2 mb-4">{group.description}</p>

                                        <div className="w-full relative overflow-hidden rounded-xl bg-[#161616] border border-white/5 group-hover:border-white/10 transition-all">
                                            <div className="relative z-10 px-4 py-3 flex items-center justify-between">
                                                <span className="text-sm font-bold text-white/90 group-hover:text-emerald-400 transition-colors">
                                                    Open Folder
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
