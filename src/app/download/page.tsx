import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer-7"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Download",
    description:
        "Download sast — the autonomous AI cybersecurity agent. Available for macOS, Linux, and Windows.",
    openGraph: {
        title: "Download sast — Autonomous AI Security Agent",
        description:
            "Get sast for your platform. Autonomous vulnerability scanning, exploit verification, and automated patching.",
        url: "https://sast.tech/download",
    },
    alternates: {
        canonical: "https://sast.tech/download",
    },
}

const platforms = [
    {
        name: "macOS",
        arch: "Apple Silicon & Intel",
        icon: (
            <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
        ),
        command: "brew install sast-tech/tap/sast",
        disabled: true,
    },
    {
        name: "Linux",
        arch: "x86_64 & ARM64",
        icon: (
            <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.345 1.884 1.345.338 0 .666-.108.922-.323.4-.335.602-.789.727-1.227.125-.44.160-.895.131-1.340.223-.422.182-.88.097-1.285-.011-.053-.010-.105-.013-.161.174-.322.26-.686.26-1.078a2.126 2.126 0 00-.072-.49c.045-.196.057-.399.033-.594-.036-.29-.135-.568-.236-.837-.112-.269-.222-.53-.235-.762a3.615 3.615 0 00-.375-1.399 2.58 2.58 0 00-.089-.164c-.053-.087-.09-.139-.099-.222-.012-.22.089-.429.196-.655.082-.174.171-.373.222-.613.373-.134.57-.395.57-.787 0-.275-.104-.525-.272-.724l-.009-.005c-.263-.259-.576-.3-.89-.3-.122 0-.233.008-.348.026-.062-.03-.126-.063-.2-.07-.07-.007-.137-.009-.2-.009-.122 0-.228.012-.319.040-.061-.065-.13-.146-.213-.233a.59.59 0 00-.159-.129.725.725 0 00-.246-.055.632.632 0 00-.116.007c-.14.022-.303.106-.49.191-.26.111-.587.269-.92.269-.09 0-.18-.009-.263-.033a1.96 1.96 0 01-.332-.134c-.166-.078-.339-.159-.511-.193-.119-.024-.236-.032-.356-.032-.292 0-.575.066-.809.162-.237.098-.434.224-.568.367a.49.49 0 00-.021-.014c-.174-.129-.373-.197-.6-.197a1.15 1.15 0 00-.204.017c-.181.033-.371.093-.571.160-.09.030-.178.068-.266.103l-.006.003a7.38 7.38 0 01-.079.032.39.39 0 00-.08.027c-.025.009-.044.019-.057.023-.05.022-.099.040-.15.056H5.2c-.055-.018-.104-.04-.157-.056-.013-.004-.032-.014-.057-.023a.39.39 0 00-.08-.027 7.38 7.38 0 01-.079-.032l-.006-.003a5.14 5.14 0 00-.266-.103 3.456 3.456 0 00-.571-.160A1.15 1.15 0 003.78 12c-.227 0-.426.068-.6.197a.49.49 0 00-.021.014c-.134-.143-.331-.269-.568-.367a2.099 2.099 0 00-.809-.162c-.12 0-.237.008-.356.032-.172.034-.345.115-.511.193a1.96 1.96 0 01-.332.134 1.143 1.143 0 01-.263.033c-.333 0-.66-.158-.92-.269-.187-.085-.35-.169-.49-.191a.632.632 0 00-.116-.007.725.725 0 00-.246.055.59.59 0 00-.159.129c-.083.087-.152.168-.213.233a1.093 1.093 0 00-.319-.040c-.063 0-.13.002-.2.009-.074.007-.138.04-.2.07a2.568 2.568 0 00-.348-.026c-.314 0-.627.041-.89.3l-.009.005a1.053 1.053 0 00-.272.724c0 .392.197.653.57.787.051.24.14.439.222.613.107.226.208.435.196.655-.009.083-.046.135-.099.222a2.58 2.58 0 00-.089.164 3.615 3.615 0 00-.375 1.399c-.013.232-.123.493-.235.762-.101.269-.2.547-.236.837a1.595 1.595 0 00.033.594 2.126 2.126 0 00-.072.49c0 .392.086.756.26 1.078-.003.056-.002.108-.013.161-.085.405-.126.863.097 1.285-.029.445.006.9.131 1.340.125.438.327.892.727 1.227.256.215.584.323.922.323.771 0 1.493-.567 1.884-1.345l.003-.003c.051-.135.089-.199.114-.333 1.003.067 1.878-.258 2.577-.2 1.030.065 1.673.331 2.26.334.238.482.682.83 1.208.946.750.2 1.690-.004 2.616-.47.864-.465 1.964-.4 2.774-.6.405-.131.766-.267.94-.601.174-.339.143-.804-.106-1.484-.076-.242-.018-.571.04-.97.028-.136.055-.337.055-.536.004-.208-.042-.413-.132-.602-.206-.411-.551-.544-.864-.68-.312-.133-.598-.201-.797-.4a3.847 3.847 0 01-.663-.839.424.424 0 00-.11-.135c.123-.805-.009-1.657-.287-2.489-.589-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298A5.63 5.63 0 0012.504 0z" />
            </svg>
        ),
        command: "curl -fsSL https://get.sast.tech | sh",
        disabled: true,
    },
    {
        name: "Windows",
        arch: "x86_64",
        icon: (
            <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
            </svg>
        ),
        command: "winget install sast-tech.sast",
        disabled: true,
    },
]

export default function DownloadPage() {
    return (
        <>
            <main className="min-h-screen bg-background">
                {/* Nav */}
                <nav className="fixed top-0 z-20 w-full border-b border-white/5 bg-background/80 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/apple-touch-icon.png"
                                alt="Sast Logo"
                                width={28}
                                height={28}
                                className="size-7"
                            />
                            <span className="text-lg font-bold tracking-tight">Sast</span>
                        </Link>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/">
                                <ArrowLeft className="mr-2 size-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </nav>

                {/* Hero */}
                <section className="pt-32 pb-16 md:pt-40 md:pb-24">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                            Download sast
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Install the autonomous AI security agent on your platform.
                            <br className="hidden sm:block" />
                            Scan, detect, and fix vulnerabilities from your terminal.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                            </span>
                            Coming soon -- Join the waitlist for early access
                        </div>
                    </div>
                </section>

                {/* Platform cards */}
                <section className="pb-16 md:pb-24">
                    <div className="mx-auto grid max-w-5xl gap-6 px-6 md:grid-cols-3">
                        {platforms.map((platform) => (
                            <div
                                key={platform.name}
                                className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[.02] p-6 transition-colors hover:border-white/20 hover:bg-white/[.04]"
                            >
                                <div className="mb-4 text-white/60">{platform.icon}</div>
                                <h2 className="text-xl font-semibold">{platform.name}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {platform.arch}
                                </p>

                                <div className="mt-6 flex-1">
                                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white/70">
                                        <Terminal className="size-4 shrink-0 text-white/40" />
                                        <code className="truncate">{platform.command}</code>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                        disabled={platform.disabled}
                                    >
                                        <Link href="/waitlist">
                                            Join Waitlist
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Requirements */}
                <section className="border-t border-white/5 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl px-6">
                        <h2 className="text-2xl font-semibold">System Requirements</h2>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-white/80">Minimum</h3>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>4 GB RAM</li>
                                    <li>2 CPU cores</li>
                                    <li>1 GB free disk space</li>
                                    <li>Internet connection</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white/80">Recommended</h3>
                                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    <li>8 GB RAM</li>
                                    <li>4 CPU cores</li>
                                    <li>5 GB free disk space</li>
                                    <li>Docker installed</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
