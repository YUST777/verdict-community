
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Verdict',
    description: 'Insights and news from the Verdict team.',
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
