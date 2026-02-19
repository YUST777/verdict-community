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
                                Verdict.run is a competitive programming platform that mirrors problems from Codeforces into a modern IDE environment. You get a full-featured code editor, AI-powered tutoring, real-time test execution, and detailed analytics — all in one place.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                How does mirroring work?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Paste any Codeforces problem URL — from contests, gym, groups, problemsets, or ACMSGURU — and we instantly mirror the problem statement, sample test cases, and constraints into our platform. You can code, test, and submit without leaving Verdict.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Which programming languages are supported?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                We support 8 languages: C++, Python, Java, Go, Rust, Kotlin, C#, and Node.js. The Monaco-powered editor provides full syntax highlighting, autocompletion, and language-specific tooling for each.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Does the AI Tutor just give me the answer?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                No. The AI Tutor is designed to teach, not spoil. It offers 3 difficulty levels — hints that nudge you toward the right approach, concept explanations that break down the theory, and guided solutions that walk you through step by step. You learn the &quot;why&quot; behind every solution.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Can I submit my solutions to Codeforces?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Yes. You can submit directly to Codeforces from within Verdict. Your submissions are tracked locally with full verdict details, runtime, and memory usage, and you can also view the global submission feed.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6" className="border-white/[0.08]">
                            <AccordionTrigger className="text-left">
                                Is the free plan really free?
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                                Yes. The free plan includes problem mirroring, the full code editor, basic test running, and Codeforces submissions — no credit card required. Pro adds AI tutoring, advanced analytics, and more.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
