
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Verdict.run',
    description: 'Read the Privacy Policy to understand how Verdict collects, uses, and protects your personal information.',
    alternates: {
        canonical: 'https://verdict.run/privacy',
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
