export default function ContestProblemPage({
    params,
}: {
    params: Promise<{ contestId: string; problemId: string }>;
}) {
    // This shell route exists so the URL input doesn't 404.
    // The actual problem viewer will be implemented later.
    void params;
    return (
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-white">
            <p className="text-white/50">Loading problem...</p>
        </div>
    );
}
