"use client";

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'

export default function Pricing() {
    const sectionRef = useRef(null)

    return (
        <section ref={sectionRef} id="pricing" className="py-16 md:py-32">
            {/* SVG pixelation filter */}
            <svg className="absolute size-0" aria-hidden="true">
                <filter id="pixelate">
                    <feFlood x="0" y="0" height="2" width="2" />
                    <feComposite width="4" height="4" />
                    <feTile result="a" />
                    <feComposite in="SourceGraphic" in2="a" operator="in" />
                    <feMorphology operator="dilate" radius="2" />
                </filter>
            </svg>
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-center text-4xl font-semibold lg:text-5xl">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-muted-foreground">
                        Start solving for free. Upgrade when you need the full competitive edge.
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
                    {/* ── Free Plan ── */}
                    <div className="rounded-2xl flex flex-col justify-between space-y-8 border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.05] shadow-2xl shadow-black/40 backdrop-blur-sm p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
                        <div className="space-y-4">
                            <div>
                                <h2 className="font-medium text-white">Free</h2>
                                <span className="my-3 block text-2xl font-semibold text-white">$0 / mo</span>
                                <p className="text-muted-foreground text-sm">For casual competitive programmers</p>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-white/[0.08] hover:bg-white/[0.05]">
                                <Link href="">Get Started</Link>
                            </Button>

                            <hr className="border-dashed border-white/[0.08]" />

                            <ul className="list-outside space-y-3 text-sm text-zinc-300">
                                {[
                                    'Mirror Codeforces Problems',
                                    'Monaco Code Editor (8 Languages)',
                                    'Basic Test Runner',
                                    'Submit to Codeforces',
                                    'Community Support',
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3 text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── Pro Plan (pixelated / coming soon) ── */}
                    <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] ring-1 ring-white/[0.05] shadow-2xl shadow-black/40 backdrop-blur-sm md:col-span-3 overflow-hidden">
                        <div
                            style={{ filter: 'url(#pixelate)' }}
                            className="p-6 lg:p-10 select-none pointer-events-none"
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="font-medium text-white">Pro</h2>
                                        <span className="my-3 block text-2xl font-semibold text-white">$9 / mo</span>
                                        <p className="text-muted-foreground text-sm">For serious competitors</p>
                                    </div>

                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Upgrade to Pro
                                    </Button>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-white">Everything in Free plus :</div>

                                    <ul className="mt-4 list-outside space-y-3 text-sm text-zinc-300">
                                        {[
                                            'AI Tutor (Guided Learning)',
                                            'AI-Generated Solutions',
                                            'Advanced Analytics & Insights',
                                            'Runtime & Memory Distributions',
                                            'Custom Test Case Builder',
                                            'Submission History & Tracking',
                                            'Priority Support',
                                            'Early Access to New Features',
                                        ].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2">
                                                <Check className="size-3 text-emerald-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
