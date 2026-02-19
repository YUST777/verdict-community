import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Facebook, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: 'About Us',
    description:
        'Learn about sast — the team building an autonomous AI cybersecurity agent for continuous vulnerability detection and automated pentesting.',
    openGraph: {
        title: 'About sast — AI-Powered Cybersecurity',
        description:
            'Securing your digital frontier with advanced AI-driven penetration testing and comprehensive vulnerability assessments.',
        url: 'https://sast.tech/company',
    },
    alternates: {
        canonical: 'https://sast.tech/company',
    },
}

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
    </svg>
)

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)

export default function CompanyPage() {
    const socialLinks = [
        { icon: <TikTokIcon className="size-6" />, href: "https://www.tiktok.com/@sast_tech", label: "TikTok", name: "TikTok" },
        { icon: <Facebook className="size-6" />, href: "https://www.facebook.com/profile.php?id=61588200480116", label: "Facebook", name: "Facebook" },
        { icon: <XIcon className="size-6" />, href: "https://x.com/sast_tech", label: "X (Twitter)", name: "X (Twitter)" },
        { icon: <Instagram className="size-6" />, href: "https://www.instagram.com/sast.tech/", label: "Instagram", name: "Instagram" },
        { icon: <Linkedin className="size-6" />, href: "https://linkedin.com/company/sast-tech", label: "LinkedIn", name: "LinkedIn" },
    ]

    return (
        <main className="min-h-screen bg-background text-foreground relative">
            {/* Logo */}
            <Link href="/" className="absolute z-50 top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                    src="/apple-touch-icon.png"
                    alt="Sast Logo"
                    width={28}
                    height={28}
                    className="size-7"
                />
                <span className="text-lg font-bold tracking-tight">Sast</span>
            </Link>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20 md:py-32">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                        About Sast
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                        Securing your digital frontier with advanced penetration testing and comprehensive vulnerability assessments.
                        At Sast, we are dedicated to providing top-tier security solutions to protect your business from evolving cyber threats.
                    </p>
                </div>

                {/* Social Links Section */}
                <div className="mt-20 mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Connect with us</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
                        {socialLinks.map((social, idx) => (
                            <Link
                                key={idx}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center space-x-4 p-6 w-full max-w-sm rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors">
                                    {social.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{social.name}</h3>
                                    <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                                        Follow us <ArrowRight className="ml-1 size-3" />
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Return Button */}
            <div className="fixed bottom-8 left-8 z-50">
                <Button
                    asChild
                    variant="outline"
                    className="gap-2"
                >
                    <Link href="/">
                        <ArrowLeft className="size-4" />
                        Return Home
                    </Link>
                </Button>
            </div>
        </main>
    )
}
