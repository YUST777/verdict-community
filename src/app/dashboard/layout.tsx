'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, Trophy, BookOpen, LogOut,
    Bell, Home, Menu, X, User, Settings,
    ChevronRight, ChevronLeft, Users, Play,
    LayoutGrid, UserCircle, Code2, Library, Medal, Megaphone, Compass,
    History, ListChecks, DoorOpen, BarChart2
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

// NavItem component for sidebar navigation
function NavItem({
    icon,
    label,
    active = false,
    collapsed = false,
    onClick,
    className = ''
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    collapsed?: boolean;
    onClick: () => void;
    className?: string;
}) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (!collapsed) return;
        const timeout = setTimeout(() => setShowTooltip(true), 500);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setShowTooltip(false);
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 relative ${active ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400' : 'text-[#A0A0A0] hover:text-[#F2F2F2] hover:bg-white/5'} ${collapsed ? 'justify-center' : ''} ${className}`}
        >
            {active && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${collapsed ? 'left-1' : ''}`} />
            )}
            <span className={active ? 'text-emerald-400' : 'group-hover:text-[#F2F2F2] transition-colors'}>
                {icon}
            </span>

            {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                    {label}
                </span>
            )}

            {/* Tooltip for collapsed state */}
            <AnimatePresence>
                {collapsed && showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -5, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-full ml-4 px-3 py-1.5 bg-[#171718] text-white text-xs font-semibold rounded-lg pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl"
                    >
                        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#171718] border-l border-b border-white/10 rotate-45 transform" />
                        <span className="relative z-10">{label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Mobile bottom navigation item
function MobileNavItem({
    icon,
    label,
    active = false,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 py-3 w-full transition-all duration-200 ${active ? 'text-emerald-400' : 'text-[#666]'}`}
        >
            {icon}
            <span className="text-[9px] font-medium text-center leading-none px-0.5">{label}</span>
        </button>
    );
}

// Skeleton loader
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [transitionsEnabled, setTransitionsEnabled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const { logout: globalLogout } = useAuth();
    const [user, setUser] = useState<any>(null);

    // Check authentication
    useEffect(() => {
        const checkAuth = async (attempt = 1) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            try {
                const res = await fetch('/api/auth/me', {
                    credentials: 'include',
                    signal: controller.signal,
                });
                const data = await res.json();
                if (res.ok && data?.authenticated && data?.user) {
                    setUser(data.user);
                } else {
                    router.replace('/register');
                }
            } catch (err) {
                // During HMR/dev recompiles, fetch can fail transiently.
                // Retry up to 3 times before giving up.
                if (attempt < 3) {
                    clearTimeout(timeoutId);
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                    return checkAuth(attempt + 1);
                }
                router.replace('/register');
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    // Check for mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load sidebar state from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            if (saved !== null) {
                setTimeout(() => setIsSidebarCollapsed(saved === 'true'), 0);
            }
            requestAnimationFrame(() => setTransitionsEnabled(true));
        } catch {
            setTimeout(() => setTransitionsEnabled(true), 0);
        }
    }, []);

    const toggleSidebar = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('sidebarCollapsed', String(collapsed));
            } catch { }
        }
    };

    const getActivePage = () => {
        if (pathname === '/dashboard' || pathname === '/dashboard/') return 'Dashboard';
        if (pathname === '/dashboard/profile') return 'Profile';
        if (pathname === '/dashboard/sessions' || pathname?.startsWith('/dashboard/sessions/')) return 'Sessions';
        if (pathname?.startsWith('/dashboard/sheets')) return 'Sheets';
        if (pathname === '/dashboard/leaderboard') return 'Leaderboard';
        if (pathname === '/dashboard/news') return 'News';
        if (pathname?.startsWith('/dashboard/rooms')) return 'Rooms';
        return 'Dashboard';
    };

    const activePage = getActivePage();
    const handleNav = (path: string) => {
        router.push(path);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await globalLogout();
        } catch (err) {
            console.error('Logout failed:', err);
            window.location.href = '/';
        }
    };

    const handleBack = () => {
        const segments = pathname?.split('/').filter(Boolean) || [];
        if (segments.length <= 1) {
            router.push('/');
            return;
        }
        const parentPath = '/' + segments.slice(0, -1).join('/');
        router.push(parentPath);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B0C] flex">
                <div className="hidden md:flex w-[256px] shrink-0 border-r border-white/5 flex-col p-6 gap-6">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <div className="space-y-2 mt-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-4 md:p-8 space-y-6">
                    <Skeleton className="h-7 w-40 rounded-lg" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div dir="ltr" className="relative min-h-screen bg-[#0B0B0C] text-[#DCDCDC] font-sans selection:bg-emerald-500 selection:text-black w-full max-w-[100vw]">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0B0C] border-b border-white/10 px-4 py-2 flex items-center justify-between h-14">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/icons/logo.svg" alt="Verdict" width={24} height={24} />
                    <span className="font-bold text-white">Verdict</span>
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1 text-white/80 hover:text-white"
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0C] border-t border-white/10 pb-[env(safe-area-inset-bottom)] grid grid-cols-6 w-full items-end">
                <MobileNavItem icon={<Home size={18} />} label="Home" active={activePage === 'Dashboard'} onClick={() => handleNav('/dashboard')} />
                <MobileNavItem icon={<User size={18} />} label="Profile" active={activePage === 'Profile'} onClick={() => handleNav('/dashboard/profile')} />
                <MobileNavItem icon={<History size={18} />} label="Sessions" active={activePage === 'Sessions'} onClick={() => handleNav('/dashboard/sessions')} />
                <MobileNavItem icon={<ListChecks size={18} />} label="Sheets" active={activePage === 'Sheets'} onClick={() => handleNav('/dashboard/sheets')} />
                <MobileNavItem icon={<Trophy size={18} />} label="Rank" active={activePage === 'Leaderboard'} onClick={() => handleNav('/dashboard/leaderboard')} />
                <MobileNavItem icon={<Megaphone size={18} />} label="News" active={activePage === 'News'} onClick={() => handleNav('/dashboard/news')} />
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="md:hidden fixed top-0 right-0 bottom-0 z-[9999] w-72 bg-[#0B0B0C] border-l border-white/10 shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <span className="font-bold text-[#F2F2F2] text-2xl">Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-white/60 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                                >
                                    <X size={32} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <nav className="flex flex-col gap-6 pt-4">
                                    <NavItem
                                        icon={<Home size={32} />}
                                        label="Home"
                                        onClick={() => { router.push('/'); setMobileMenuOpen(false); }}
                                        className="text-lg font-medium"
                                    />
                                </nav>
                            </div>
                            <div className="p-4 border-t border-white/10">
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center overflow-hidden shrink-0">
                                        <User size={16} className="text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{user?.name || user?.email?.split('@')[0]}</p>
                                        <p className="text-[10px] text-[#666] truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-[#A0A0A0] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Sign Out"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 80 : 256 }}
                transition={transitionsEnabled ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
                className={`bg-[#0B0B0C] border-r border-white/10 flex flex-col shrink-0 fixed h-full z-50 hidden md:flex ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}
            >
                <div className="flex-1">
                    <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/icons/logo.svg" alt="Verdict" width={28} height={28} />
                            {!isSidebarCollapsed && (
                                <span className="font-bold text-white text-lg">Verdict</span>
                            )}
                        </Link>
                        {!isSidebarCollapsed && (
                            <button
                                onClick={() => toggleSidebar(true)}
                                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col items-center w-full">
                        {isSidebarCollapsed && (
                            <button
                                onClick={() => toggleSidebar(false)}
                                className="mb-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronRight size={24} strokeWidth={2} />
                            </button>
                        )}
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="px-4 py-2 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                            Training
                        </div>
                    )}
                    <nav className="mt-2 space-y-1 px-2">
                        <NavItem collapsed={isSidebarCollapsed} icon={<Home size={20} />} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => handleNav('/dashboard')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<User size={20} />} label="My Profile" active={activePage === 'Profile'} onClick={() => handleNav('/dashboard/profile')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<History size={20} />} label="Sessions" active={activePage === 'Sessions'} onClick={() => handleNav('/dashboard/sessions')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<ListChecks size={20} />} label="Training Sheets" active={activePage === 'Sheets'} onClick={() => handleNav('/dashboard/sheets')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<Trophy size={20} />} label="Leaderboard" active={activePage === 'Leaderboard'} onClick={() => handleNav('/dashboard/leaderboard')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<Megaphone size={20} />} label="Team News" active={activePage === 'News'} onClick={() => handleNav('/dashboard/news')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={<DoorOpen size={20} />} label="Rooms" active={activePage === 'Rooms'} onClick={() => handleNav('/dashboard/rooms')} />
                    </nav>
                </div>

                <div className="p-2 border-t border-white/5 mt-auto">
                    <Link
                        href="/"
                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0">
                            <User size={16} className="text-emerald-400" />
                        </div>
                        {!isSidebarCollapsed && (
                            <>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-xs font-bold text-white truncate">{user?.name || user?.email?.split('@')[0]}</p>
                                    <p className="text-[10px] text-[#666] truncate group-hover:text-emerald-400 transition-colors">Back to Home</p>
                                </div>
                                <Home size={14} className="text-[#666] group-hover:text-white transition-colors" />
                            </>
                        )}
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
                initial={false}
                animate={{ marginLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 256) }}
                transition={transitionsEnabled ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
                className="pt-14 md:pt-0 pb-16 md:pb-0 max-md:!ml-0 max-md:!w-full max-w-[100vw]"
            >
                {/* Desktop Header */}
                <header className="sticky top-0 z-40 w-full h-16 bg-[#0B0B0C] flex items-center justify-between px-4 md:px-8 hidden md:flex">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#A0A0A0]">
                        <button onClick={handleBack} className="hover:text-white transition-colors mr-2">
                            <ChevronLeft size={16} />
                        </button>
                        {pathname?.split('/').filter(Boolean).map((segment, index, array) => {
                            let label = segment.toUpperCase().replace(/-/g, ' ');
                            if (segment === 'dashboard') label = 'DASHBOARD';
                            else if (segment === 'sheets') label = 'SHEETS';
                            else if (segment === 'profile') label = 'PROFILE';
                            else if (segment === 'leaderboard') label = 'LEADERBOARD';
                            else if (segment === 'rooms') label = 'ROOMS';

                            const isLast = index === array.length - 1;

                            return (
                                <div key={segment} className="flex items-center gap-2">
                                    {index > 0 && <ChevronRight size={14} className="text-[#444]" />}
                                    <span className={isLast ? "text-[#F2F2F2]" : "hover:text-[#F2F2F2] transition-colors"}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleNav('/dashboard/news')}
                            className="text-[#555] hover:text-white transition-colors"
                            title="Notifications"
                        >
                            <Bell size={18} strokeWidth={1.2} />
                        </button>
                        <button
                            onClick={() => handleNav('/dashboard/settings')}
                            className="text-[#555] hover:text-white transition-colors"
                            title="Settings"
                        >
                            <Settings size={18} strokeWidth={1.2} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-[#555] hover:text-red-500 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} strokeWidth={1.2} />
                        </button>
                    </div>
                </header>

                <div className="px-4 py-2 md:p-8 max-w-none md:max-w-6xl mx-auto">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}
