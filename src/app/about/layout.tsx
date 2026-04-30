
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Verdict - The Modern Competitive Programming Platform',
    description: 'Learn about Verdict.run, the ultimate competitive programming platform. Built for speed, designed for competitive programmers who want instant verdicts on their code.',
    alternates: {
        canonical: 'https://verdict.run/about',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
