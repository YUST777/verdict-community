import ClientPage from './ClientPage';

export default function ContestProblemPage({
    params,
}: {
    params: Promise<{ contestId: string; problemId: string }>;
}) {
    // The actual problem viewer implemented via ClientPage
    void params;
    return <ClientPage />;
}
