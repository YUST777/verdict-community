import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Workspace - Verdict.run | Start Getting Instant Verdicts',
    description: 'Mirror any Codeforces problem and start coding. Get instant verdicts on your code with our modern competitive programming IDE.',
    alternates: {
        canonical: 'https://verdict.run/workspace',
    },
};

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
