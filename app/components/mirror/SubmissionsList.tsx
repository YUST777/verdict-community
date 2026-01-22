
import { useState, useEffect, useCallback } from 'react';
import { Loader2, History, Globe, User, Clock, HardDrive, RefreshCw } from 'lucide-react';
import { Submission } from './types';

interface SubmissionsListProps {
    submissions: Submission[];
    loading: boolean;
    onViewCode: (id: number) => void;
    contestId?: string;
    problemIndex?: string;
}

interface GlobalSubmission {
    id: number;
    creationTimeSeconds: number;
    author: string;
    verdict: string;
    timeConsumedMillis: number;
    memoryConsumedBytes: number;
    language: string;
}

export default function SubmissionsList({ submissions, loading, onViewCode, contestId, problemIndex }: SubmissionsListProps) {
    const [mode, setMode] = useState<'local' | 'global'>('local');
    const [globalSubmissions, setGlobalSubmissions] = useState<GlobalSubmission[]>([]);
    const [globalLoading, setGlobalLoading] = useState(false);

    const fetchGlobal = useCallback(async () => {
        if (!contestId) return;
        setGlobalLoading(true);
        try {
            const res = await fetch(`/api/codeforces/submissions?contestId=${contestId}&problemIndex=${problemIndex}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setGlobalSubmissions(data);
            }
        } catch (err) {
            console.error('Failed to fetch global submissions', err);
        } finally {
            setGlobalLoading(false);
        }
    }, [contestId, problemIndex]);

    useEffect(() => {
        if (mode === 'global' && globalSubmissions.length === 0) {
            fetchGlobal();
        }
    }, [mode, globalSubmissions.length, fetchGlobal]);

    return (
        <div className="space-y-4">
            {/* Toggle Header */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
                <button
                    onClick={() => setMode('local')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${mode === 'local' ? 'bg-[#10B981] text-white shadow-lg' : 'text-[#666] hover:text-white'}`}
                >
                    <User size={14} /> Your Submissions
                </button>
                <button
                    onClick={() => setMode('global')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${mode === 'global' ? 'bg-[#10B981] text-white shadow-lg' : 'text-[#666] hover:text-white'}`}
                    disabled={!contestId} // Disable if no contestId (e.g. local problem?)
                    title={!contestId ? "Not available for this problem" : "View global activity"}
                >
                    <Globe size={14} /> Global Feed
                </button>
            </div>

            {/* List Content */}
            {mode === 'local' ? (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#10B981]" size={32} />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12 text-[#666]">
                            <History size={40} className="mx-auto mb-3 opacity-50" />
                            <p>No local submissions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    onClick={() => onViewCode(sub.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${sub.verdict === 'Accepted'
                                        ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15'
                                        : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-medium text-sm ${sub.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {sub.verdict}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[#666]">
                                                Attempt #{sub.attemptNumber}
                                            </span>
                                            <span className="text-xs text-[#34D399] hover:underline">View Code →</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#808080]">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {sub.timeMs ? `${sub.timeMs}ms` : '-'}</span>
                                        <span className="flex items-center gap-1"><HardDrive size={12} /> {sub.memoryKb ? `${sub.memoryKb}KB` : '-'}</span>
                                        <span>{sub.testsPassed}/{sub.totalTests} passed</span>
                                        <span className="ml-auto">
                                            {new Date(sub.submittedAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* Global Feed Mode */
                <>
                    <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-xs text-[#666]">Live from Codeforces (Last 50)</span>
                        <button onClick={fetchGlobal} className="text-[#34D399] hover:rotate-180 transition-all p-1">
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {globalLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#10B981]" size={32} />
                        </div>
                    ) : globalSubmissions.length === 0 ? (
                        <div className="text-center py-12 text-[#666]">
                            <Globe size={40} className="mx-auto mb-3 opacity-50" />
                            <p>No global submissions found recently</p>
                            <p className="text-xs opacity-70 mt-1">Be the first to solve it!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {globalSubmissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className={`p-3 rounded-lg border bg-[#121212] transition-colors border-white/5`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm">{sub.author}</span>
                                            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-[#888]">{sub.language}</span>
                                        </div>

                                        <span className={`font-medium text-sm ${sub.verdict === 'OK' ? 'text-green-400' :
                                            sub.verdict === 'WRONG_ANSWER' ? 'text-red-400' : 'text-blue-300'
                                            }`}>
                                            {sub.verdict === 'OK' ? 'Accepted' : sub.verdict.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#808080]">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {sub.timeConsumedMillis}ms</span>
                                        <span className="flex items-center gap-1"><HardDrive size={12} /> {Math.round(sub.memoryConsumedBytes / 1024)}KB</span>
                                        <span className="ml-auto flex items-center gap-1">
                                            {new Date(sub.creationTimeSeconds * 1000).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
