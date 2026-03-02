'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, ArrowRight, Play, Github } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { AppShowcase } from '@/components/ui/app-showcase'
import { DemoModal } from '@/components/ui/demo-modal'
import GradientButton from '@/components/ui/button-1'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    const [contestUrl, setContestUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const router = useRouter()

    const parseCodeforcesUrl = (url: string) => {
        if (!url) return null
        const cleanUrl = url.split('?')[0].split('#')[0]

        const groupProblem = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i)
        if (groupProblem) return { type: 'group', groupId: groupProblem[1], contestId: groupProblem[2], problemId: groupProblem[3].toUpperCase() }

        const contestProblem = cleanUrl.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i)
        if (contestProblem) return { type: 'contest', contestId: contestProblem[1], problemId: contestProblem[2].toUpperCase() }

        const gymProblem = cleanUrl.match(/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i)
        if (gymProblem) return { type: 'gym', contestId: gymProblem[1], problemId: gymProblem[2].toUpperCase() }

        const problemset = cleanUrl.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i)
        if (problemset) return { type: 'problemset', contestId: problemset[1], problemId: problemset[2].toUpperCase() }

        const acmsguru = cleanUrl.match(/problemsets\/acmsguru\/problem\/99999\/(\d+)/i)
        if (acmsguru) return { type: 'acmsguru', contestId: '99999', problemId: acmsguru[1] }

        const groupGeneric = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)/i)
        if (groupGeneric) return { type: 'group', groupId: groupGeneric[1], contestId: groupGeneric[2], problemId: 'A' }

        const contestGeneric = cleanUrl.match(/contest\/(\d+)/i)
        if (contestGeneric) return { type: 'contest', contestId: contestGeneric[1], problemId: 'A' }

        const gymGeneric = cleanUrl.match(/gym\/(\d+)/i)
        if (gymGeneric) return { type: 'gym', contestId: gymGeneric[1], problemId: 'A' }

        return null
    }

    const handleMirror = () => {
        const parsed = parseCodeforcesUrl(contestUrl.trim())
        if (parsed) {
            setIsLoading(true)
            if (parsed.type === 'group' && 'groupId' in parsed) {
                router.push(`/group/${parsed.groupId}/contest/${parsed.contestId}/problem/${parsed.problemId}`)
            } else if (parsed.type === 'gym') {
                router.push(`/gym/${parsed.contestId}/problem/${parsed.problemId}`)
            } else if (parsed.type === 'problemset') {
                router.push(`/problemset/problem/${parsed.contestId}/${parsed.problemId}`)
            } else if (parsed.type === 'acmsguru') {
                router.push(`/problemsets/acmsguru/problem/99999/${parsed.problemId}`)
            } else {
                router.push(`/contest/${parsed.contestId}/problem/${parsed.problemId}`)
            }
        }
    }

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                {/* Background video */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                    >
                        <source src="/videos/huly_laser.webm" type="video/webm" />
                    </video>
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-background to-transparent" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <h1 className="mt-8 max-w-4xl mx-auto text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        Solve Problems<br />Without Limits
                                    </h1>
                                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        Mirror Codeforces problems instantly. Code, test, and submit — all in one beautiful interface that works everywhere.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-10 md:mt-14">
                                    <div className="max-w-2xl mx-auto">
                                        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all focus-within:border-emerald-500/50 focus-within:bg-white/10">
                                            <input
                                                type="text"
                                                value={contestUrl}
                                                onChange={(e) => setContestUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleMirror()}
                                                placeholder="Paste Codeforces problem URL..."
                                                className="flex-1 px-5 py-4 bg-transparent text-white placeholder-white/50 focus:outline-none text-base"
                                            />
                                            <button
                                                onClick={handleMirror}
                                                disabled={!parseCodeforcesUrl(contestUrl) || isLoading}
                                                className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 cursor-pointer"
                                            >
                                                {isLoading ? (
                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        Mirror <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 px-1">
                                            <p className="text-xs text-white/40 font-medium">
                                                Supports: contest, gym, group, problemset, and ACM SGURU URLs
                                            </p>
                                            <button
                                                onClick={() => setShowVideo(true)}
                                                className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group cursor-pointer"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                                                    <Play size={8} className="fill-current ml-0.5" />
                                                </div>
                                                Watch Demo
                                            </button>
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 px-2 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] backdrop-blur-sm">
                                    <AppShowcase />
                                </div>
                                <div className="relative z-20 mx-auto mt-8 flex flex-row w-full items-center justify-center gap-2 sm:gap-4 px-2 sm:w-auto sm:px-0">
                                    <a href="/contest/1/problem/A" className="w-1/2 sm:w-auto">
                                        <GradientButton width="100%" height="48px" className="sm:min-w-[180px] px-6 [&_.label]:text-[11px] sm:[&_.label]:text-sm">
                                            <Play size={14} className="fill-current shrink-0 hidden sm:block" />
                                            Try it Live
                                        </GradientButton>
                                    </a>
                                    <a href="https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj" target="_blank" rel="noopener noreferrer" className="w-1/2 sm:w-auto">
                                        <GradientButton width="100%" height="48px" className="sm:min-w-[240px] px-8 [&_.label]:text-[11px] sm:[&_.label]:text-sm">
                                            <ArrowRight size={14} className="shrink-0 hidden sm:block" />
                                            Download Extension
                                        </GradientButton>
                                    </a>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>

            <DemoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [stars, setStars] = React.useState<number | null>(null)

    React.useEffect(() => {
        fetch('https://api.github.com/repos/YUST777/verdict-community')
            .then(res => res.json())
            .then(data => setStars(data.stargazers_count))
            .catch(err => console.error('Error fetching stars:', err))
    }, [])

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const playStarSound = () => {
        const audio = new Audio('/images/star.mp3')
        audio.volume = 0.5
        audio.play().catch(() => { })
    }

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border border-white/[0.08] backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Link
                                    href="https://github.com/YUST777/verdict-community"
                                    target="_blank"
                                    onClick={playStarSound}
                                    className="group/star flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all border border-white/[0.08] hover:border-white/[0.15]">
                                    <Github className="size-[18px] transition-colors group-hover/star:text-white" />
                                    <span className="text-sm font-bold tracking-wide text-white">{stars !== null ? stars : '...'}</span>
                                    <Image
                                        src="/images/star.webp"
                                        alt="Star"
                                        width={20}
                                        height={20}
                                        className="object-contain group-hover/star:scale-110 transition-transform ml-0.5"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Image
                src="/icons/logo.svg"
                alt="Verdict logo"
                width={28}
                height={28}
                className="size-7"
            />
            <span className="text-lg font-bold tracking-tight">verdict.run</span>
        </div>
    )
}
