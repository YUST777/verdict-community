
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Verdict.run | Competitive Programming Tips & Updates',
    description: 'Insights, tutorials, and news from the Verdict team. Learn competitive programming strategies, algorithm explanations, and platform updates.',
    alternates: {
        canonical: 'https://verdict.run/blog',
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
