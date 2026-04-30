
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - Verdict.run',
    description: 'Read the Terms of Service for using the Verdict.run platform.',
    alternates: {
        canonical: 'https://verdict.run/terms',
    },
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
