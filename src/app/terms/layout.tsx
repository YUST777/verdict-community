
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - Verdict',
    description: 'Read the Terms of Service for using the Verdict.run platform.',
    alternates: {
        canonical: './',
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
