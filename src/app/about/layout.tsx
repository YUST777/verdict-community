
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About - Verdict',
    description: 'Learn about the mission behind Verdict and why we are building the ultimate competitive programming platform.',
    alternates: {
        canonical: './',
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
