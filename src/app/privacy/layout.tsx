
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Verdict',
    description: 'Read the Privacy Policy to understand how Verdict collects, uses, and protects your personal information.',
    alternates: {
        canonical: './',
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
