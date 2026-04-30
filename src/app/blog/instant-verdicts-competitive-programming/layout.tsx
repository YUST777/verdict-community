import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to Get Instant Verdicts on Your Competitive Programming Code | Verdict.run',
    description: 'Learn how Verdict delivers instant feedback on your code submissions, helping you practice competitive programming faster with immediate verdicts.',
    alternates: {
        canonical: 'https://verdict.run/blog/instant-verdicts-competitive-programming',
    },
};

export default function BlogPostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
