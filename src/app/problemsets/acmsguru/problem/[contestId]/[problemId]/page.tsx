export default function AcmsgruProblemPage({
    params,
}: {
    params: Promise<{ contestId: string; problemId: string }>;
}) {
    void params;
    return (
        <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center text-white">
            <p className="text-white/50">Loading problem...</p>
        </div>
    );
}
