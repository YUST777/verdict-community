import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function Faq() {
    return (
        <section id="faq" className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-center text-4xl font-semibold lg:text-5xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about Verdict.run.
                    </p>
                </div>
                <div className="mx-auto mt-8 max-w-3xl md:mt-20">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                What is Verdict.run?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Verdict.run is a competitive programming platform that gives you instant verdicts on your code. Mirror Codeforces problems into a modern IDE environment with a full-featured code editor, AI-powered tutoring, real-time test execution, and detailed analytics — all in one place.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                How does mirroring work?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Paste any Codeforces problem URL — from contests, gym, groups, problemsets, or ACMSGURU — and Verdict instantly mirrors the problem statement, sample test cases, and constraints into our platform. You can code, test, and get instant verdicts without leaving Verdict.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Which programming languages are supported?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Verdict supports 8 languages: C++, Python, Java, Go, Rust, Kotlin, C#, and Node.js. The Monaco-powered editor provides full syntax highlighting, autocompletion, and language-specific tooling for each language to help you get instant verdicts on your code.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Does the AI Tutor just give me the answer?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                No. The AI Tutor is designed to teach, not spoil. It offers 3 difficulty levels — hints that nudge you toward the right approach, concept explanations that break down the theory, and guided solutions that walk you through step by step. You learn the "why" behind every solution and get better verdicts on your code.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Can I submit my solutions to Codeforces?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Yes. You can submit directly to Codeforces from within Verdict and get instant verdicts. Your submissions are tracked locally with full verdict details, runtime, and memory usage, and you can also view the global submission feed.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Is the free plan really free?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Yes. The free plan includes problem mirroring, the full code editor, basic test running with instant verdicts, and Codeforces submissions — no credit card required. Pro adds AI tutoring, advanced analytics, and more.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "What is Verdict.run?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Verdict.run is a competitive programming platform that gives you instant verdicts on your code. Mirror Codeforces problems into a modern IDE environment with a full-featured code editor, AI-powered tutoring, real-time test execution, and detailed analytics — all in one place."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "How does mirroring work?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Paste any Codeforces problem URL — from contests, gym, groups, problemsets, or ACMSGURU — and Verdict instantly mirrors the problem statement, sample test cases, and constraints into our platform. You can code, test, and get instant verdicts without leaving Verdict."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Which programming languages are supported?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Verdict supports 8 languages: C++, Python, Java, Go, Rust, Kotlin, C#, and Node.js. The Monaco-powered editor provides full syntax highlighting, autocompletion, and language-specific tooling for each language."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Does the AI Tutor just give me the answer?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "No. The AI Tutor is designed to teach, not spoil. It offers 3 difficulty levels — hints that nudge you toward the right approach, concept explanations that break down the theory, and guided solutions that walk you through step by step."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Can I submit my solutions to Codeforces?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Yes. You can submit directly to Codeforces from within Verdict and get instant verdicts. Your submissions are tracked locally with full verdict details, runtime, and memory usage."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Is the free plan really free?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Yes. The free plan includes problem mirroring, the full code editor, basic test running with instant verdicts, and Codeforces submissions â no credit card required."
                                        }
                                    }
                                ]
                            })
                        }}
                    />
                </div>
            </div>
        </section>
    )
}
