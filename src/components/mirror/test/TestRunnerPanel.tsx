import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Play,
    CloudUpload,
    Clock,
    Database,
    Loader2,
    ExternalLink,
    Send,
    Plus,
    Edit2,
    Save,
    X,
    AlertTriangle
} from 'lucide-react';
import { SubmissionResult, Example, CFSubmissionStatus, TestCaseResult, CFSubmissionTestCase, customTestCaseSchema } from '../shared/types';

interface TestRunnerPanelProps {
    activeTab: 'testcase' | 'result' | 'codeforces';
    setActiveTab: (tab: 'testcase' | 'result' | 'codeforces') => void;
    selectedTestCase: number;
    setSelectedTestCase: (index: number) => void;
    testCases: Example[];
    result: SubmissionResult | null;
    cfStatus: CFSubmissionStatus | null;
    contestId?: string;
    problemId?: string;
    onAddTestCase?: (testCase: Example) => void;
    onDeleteTestCase?: (index: number) => void;
    onUpdateTestCase?: (index: number, testCase: Example) => void;
    sampleTestCasesCount?: number;
}

export default function TestRunnerPanel({
    activeTab,
    setActiveTab,
    selectedTestCase,
    setSelectedTestCase,
    testCases,
    result,
    cfStatus,
    contestId,
    problemId,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    sampleTestCasesCount = 0
}: TestRunnerPanelProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formInput, setFormInput] = useState('');
    const [formOutput, setFormOutput] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [handleInput, setHandleInput] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('verdict-cf-handle') || '';
            } catch {}
        }
        return '';
    });

    const handleAddTestCase = () => {
        setFormError(null);
        const result = customTestCaseSchema.safeParse({ input: formInput, output: formOutput });
        if (!result.success) {
            setFormError(result.error.issues[0]?.message || 'Invalid input');
            return;
        }
        const newTestCase: Example = { input: formInput.trim(), output: formOutput.trim(), expectedOutput: formOutput.trim(), isCustom: true };
        onAddTestCase?.(newTestCase);
        setFormInput(''); setFormOutput(''); setShowAddForm(false);
    };

    const handleUpdateTestCase = () => {
        if (editingIndex === null) return;
        setFormError(null);
        const result = customTestCaseSchema.safeParse({ input: formInput, output: formOutput });
        if (!result.success) {
            setFormError(result.error.issues[0]?.message || 'Invalid input');
            return;
        }
        const updatedTestCase: Example = { input: formInput.trim(), output: formOutput.trim(), expectedOutput: formOutput.trim(), isCustom: true };
        onUpdateTestCase?.(editingIndex, updatedTestCase);
        setFormInput(''); setFormOutput(''); setEditingIndex(null);
    };

    const startEditing = (index: number) => {
        const tc = testCases[index];
        setFormInput(tc.input);
        setFormOutput(tc.output || tc.expectedOutput || '');
        setEditingIndex(index); setShowAddForm(false); setFormError(null);
    };

    const cancelEditing = () => {
        setEditingIndex(null); setShowAddForm(false); setFormInput(''); setFormOutput(''); setFormError(null);
    };

    const isCustomTestCase = (index: number) => index >= sampleTestCasesCount || testCases[index]?.isCustom;

    const getVerdictIcon = (verdict: string) => {
        if (verdict === 'Accepted' || verdict === 'OK') return <CheckCircle2 size={18} className="text-green-400" />;
        if (verdict.includes('Wrong')) return <XCircle size={18} className="text-red-400" />;
        if (verdict.includes('Time')) return <Clock size={18} className="text-yellow-400" />;
        if (verdict.includes('Memory')) return <Database size={18} className="text-blue-400" />;
        if (verdict.includes('Testing') || verdict.includes('Running')) return <Loader2 size={18} className="text-blue-400 animate-spin" />;
        if (verdict.includes('Queue') || verdict === 'Submitted') return <Loader2 size={18} className="text-gray-400 animate-spin" />;
        if (verdict.includes('Compilation')) return <XCircle size={18} className="text-orange-400" />;
        if (verdict.includes('Runtime')) return <XCircle size={18} className="text-purple-400" />;
        return <XCircle size={18} className="text-red-400" />;
    };

    const getVerdictShort = (verdict: string) => {
        if (verdict === 'Accepted' || verdict === 'OK') return 'AC';
        if (verdict.includes('Wrong')) return 'WA';
        if (verdict.includes('Time Limit')) return 'TLE';
        if (verdict.includes('Memory')) return 'MLE';
        if (verdict.includes('Compilation')) return 'CE';
        if (verdict.includes('Runtime')) return 'RE';
        return verdict.slice(0, 3).toUpperCase();
    };

    const getCFStatusColor = () => {
        if (!cfStatus) return 'text-[#666]';
        switch (cfStatus.status) {
            case 'submitting': return 'text-blue-400';
            case 'waiting': return 'text-yellow-400';
            case 'testing': return 'text-blue-400';
            case 'done':
                return cfStatus.verdict === 'OK' || cfStatus.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400';
            case 'error': return 'text-red-400';
            default: return 'text-[#666]';
        }
    };

    const getCFStatusBg = () => {
        if (!cfStatus) return 'bg-white/5';
        switch (cfStatus.status) {
            case 'submitting': return 'bg-blue-500/10 border-blue-500/20';
            case 'waiting': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'testing': return 'bg-blue-500/10 border-blue-500/20';
            case 'done':
                return cfStatus.verdict === 'OK' || cfStatus.verdict === 'Accepted'
                    ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    // ── CF Status Tab ──
    const renderCFStatus = () => {
        if (!cfStatus || cfStatus.status === 'idle') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#252526] flex items-center justify-center">
                        <img src="https://codeforces.org/s/0/favicon-32x32.png" alt="CF" className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-white/80">Submit to Codeforces to Solve</p>
                    <p className="text-xs text-[#888] max-w-xs leading-relaxed">
                        Use the <strong>Submit</strong> button in the header above to open the Codeforces submit page directly.
                    </p>
                </div>
            );
        }

        const isVerifyPending = cfStatus.substatus === 'verify-pending';

        if (isVerifyPending) {
            const verifying = cfStatus.progress === 50;
            const hasError = cfStatus.status === 'error';

            return (
                <div className="h-full flex flex-col space-y-4 p-4 bg-[#252526]/30 rounded-xl border border-white/5 animate-fade-in text-left">
                    <div className="flex items-center gap-3 text-emerald-400">
                        <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CloudUpload size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">Verify Codeforces Submission</h3>
                            <p className="text-[10px] text-[#888]">Verify and apply your AC progress locally</p>
                        </div>
                    </div>

                    <div className="text-[11px] text-[#b8b8b8] bg-white/5 p-3 rounded-lg leading-relaxed space-y-2">
                        <p><strong>1. Submit Code:</strong> Make sure you have submitted your solution on Codeforces (opened in the other tab).</p>
                        <p><strong>2. Check Result:</strong> Once you get <strong>Accepted (AC)</strong> on Codeforces, enter your handle below and click verify to sync your progress here!</p>
                    </div>

                    {hasError && cfStatus.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-2 leading-relaxed">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>{cfStatus.error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-[#888] uppercase tracking-wider">Codeforces Handle</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={handleInput}
                                onChange={(e) => {
                                    setHandleInput(e.target.value);
                                    try {
                                        localStorage.setItem('verdict-cf-handle', e.target.value);
                                    } catch {}
                                }}
                                disabled={verifying}
                                placeholder="Enter your CF handle (e.g. tourist)"
                                className="flex-1 bg-[#1a1a1a] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-[#555] focus:outline-none transition-colors"
                            />
                            <button
                                onClick={async () => {
                                    if (!handleInput.trim()) return;
                                    const verifyFn = (window as any).__verdict_verify_cf;
                                    if (verifyFn) {
                                        await verifyFn(handleInput.trim());
                                    }
                                }}
                                disabled={verifying || !handleInput.trim()}
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/20 disabled:text-[#666] text-white font-semibold rounded-lg transition-colors text-xs shrink-0 cursor-pointer"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" /> Verifying...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={12} /> Apply Solution
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {contestId && problemId && (
                        <div className="pt-2 flex items-center justify-between border-t border-white/5">
                            <a
                                href={`https://codeforces.com/contest/${contestId}/submit?problemIndex=${problemId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                            >
                                Open Codeforces Submit Page Again <ExternalLink size={10} />
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col space-y-2 animate-fade-in text-left">
                {/* Login/Captcha Required */}
                {(cfStatus.needsCaptcha) && (
                    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-orange-500/10 border-orange-500/20 text-orange-400">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500/20"><AlertTriangle size={18} /></div>
                            <div className="flex-1">
                                <div className="font-bold text-lg">Login / Captcha Required</div>
                                <div className="text-xs opacity-70 mt-0.5">Please log in or solve the captcha on Codeforces</div>
                            </div>
                        </div>
                        <div className="bg-orange-500/10 rounded-lg p-3 text-xs text-orange-300">
                            <ol className="list-decimal list-inside space-y-1 text-orange-200">
                                <li>Click the button below to open Codeforces</li>
                                <li>Log in or complete the captcha</li>
                                <li>Come back and click Submit again</li>
                            </ol>
                        </div>
                        {cfStatus.captchaUrl && (
                            <a href={cfStatus.captchaUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm">
                                <img src="https://codeforces.org/s/0/favicon-32x32.png" alt="CF" className="w-4 h-4" />
                                Open Codeforces <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                )}

                {/* Duplicate */}
                {cfStatus.isDuplicate && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                        <div className="p-2 rounded-full bg-yellow-500/20"><XCircle size={18} /></div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">Duplicate Submission</div>
                            <div className="text-xs opacity-70 mt-0.5">You have submitted exactly the same code before!</div>
                        </div>
                    </div>
                )}

                {/* Status Card */}
                {!cfStatus.isDuplicate && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${getCFStatusBg()} ${getCFStatusColor()}`}>
                        <div className={`p-2 rounded-full ${getCFStatusBg()}`}>
                            {cfStatus.status === 'submitting' || cfStatus.status === 'waiting' || cfStatus.status === 'testing' ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : cfStatus.verdict ? (
                                getVerdictIcon(cfStatus.verdict)
                            ) : cfStatus.status === 'error' ? (
                                <XCircle size={18} />
                            ) : (
                                <Send size={18} />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">
                                {cfStatus.status === 'submitting' && (cfStatus.substatus || 'Submitting to Codeforces...')}
                                {cfStatus.status === 'waiting' && (cfStatus.substatus || 'In Queue...')}
                                {cfStatus.status === 'testing' && `Testing on test ${cfStatus.testNumber || '?'}...`}
                                {cfStatus.status === 'done' && (cfStatus.verdict || 'Done')}
                                {cfStatus.status === 'error' && (cfStatus.error || 'Submission Failed')}
                            </div>
                            <div className="text-xs opacity-70 mt-0.5 font-mono">
                                {cfStatus.status === 'submitting' && cfStatus.substatus && <>{cfStatus.substatus}</>}
                                {cfStatus.status === 'done' && cfStatus.time !== undefined && cfStatus.memory !== undefined && (
                                    <>{cfStatus.time} ms {'\u2022'} {cfStatus.memory} KB</>
                                )}
                                {cfStatus.status === 'testing' && cfStatus.testNumber && <>Running test {cfStatus.testNumber}...</>}
                            </div>
                            {cfStatus.status === 'submitting' && cfStatus.progress !== undefined && (
                                <div className="mt-2 w-full bg-[#333] rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000 ease-out" style={{ width: `${cfStatus.progress}%` }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Failed Test */}
                {cfStatus.status === 'done' && !!cfStatus.failedTestCase && cfStatus.verdict !== 'Accepted' && cfStatus.verdict !== 'Compilation Error' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <XCircle size={16} />
                            <span className="font-semibold text-sm">Failed on Test {cfStatus.failedTestCase}</span>
                        </div>
                        <div className="text-xs text-[#888]">
                            {!!cfStatus.testNumber && cfStatus.testNumber > 0 && (
                                <span>Passed {cfStatus.testNumber} test{cfStatus.testNumber !== 1 ? 's' : ''} before failing</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Accepted */}
                {cfStatus.status === 'done' && cfStatus.verdict === 'Accepted' && !!cfStatus.testNumber !== undefined && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={16} />
                            <span className="font-semibold text-sm">Solved successfully on Codeforces!</span>
                        </div>
                    </div>
                )}

                {/* Judgement Protocol — Compilation Error */}
                {cfStatus.compilationError && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 text-orange-400 text-sm font-semibold border-b border-orange-500/20">Judgement protocol</div>
                        <pre className="p-3 text-xs text-orange-300 max-h-60 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">{cfStatus.compilationError}</pre>
                    </div>
                )}

                {/* Judgement Protocol — Test Details */}
                {cfStatus.details && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 text-orange-400 text-sm font-semibold border-b border-orange-500/20">Judgement protocol</div>
                        <pre className="p-3 text-xs text-orange-300 max-h-60 overflow-auto whitespace-pre-wrap font-mono leading-relaxed">{cfStatus.details}</pre>
                    </div>
                )}

                {/* Submission ID */}
                {cfStatus.submissionId && (
                    <div className="flex items-center justify-between p-3 bg-[#252526] rounded-lg border border-white/5">
                        <div className="text-xs text-[#888]">Submission ID: <span className="text-white font-mono">#{cfStatus.submissionId}</span></div>
                        <a href={`https://codeforces.com/contest/${contestId}/submission/${cfStatus.submissionId}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-[#10B981] hover:text-[#34D399] transition-colors font-semibold">
                            View on Codeforces <ExternalLink size={12} />
                        </a>
                    </div>
                )}

                {/* Quick Links */}
                {contestId && problemId && (
                    <div className="flex gap-2">
                        <a href={`https://codeforces.com/contest/${contestId}/my`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#252526] hover:bg-[#2d2d2d] rounded-lg border border-white/5 text-xs text-[#888] hover:text-white transition-colors">
                            My Submissions <ExternalLink size={10} />
                        </a>
                        <a href={`https://codeforces.com/contest/${contestId}/status/${problemId}`} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#252526] hover:bg-[#2d2d2d] rounded-lg border border-white/5 text-xs text-[#888] hover:text-white transition-colors">
                            All Submissions <ExternalLink size={10} />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    // ── Main Render ──
    return (
        <div className="flex-1 overflow-y-auto px-2.5 md:px-4 py-3 md:py-4 bg-[#1a1a1a] flex flex-col">
            {activeTab === 'testcase' ? (
                <>
                    {/* Case Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {testCases.map((tc, index) => (
                            <div key={index} className="relative group">
                                <button
                                    onClick={() => { setSelectedTestCase(index); cancelEditing(); }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${selectedTestCase === index
                                        ? 'bg-[#252526] text-white shadow-sm'
                                        : 'text-[#666] hover:text-[#A0A0A0] hover:bg-[#252526]/50'
                                    } ${tc.isCustom ? 'pr-7' : ''}`}
                                >
                                    {result && result.results[index] && (
                                        result.results[index].passed
                                            ? <CheckCircle2 size={12} className="text-green-400" />
                                            : <XCircle size={12} className="text-red-400" />
                                    )}
                                    {tc.isCustom && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Custom test case" />}
                                    Case {index + 1}
                                </button>
                                {isCustomTestCase(index) && onDeleteTestCase && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this test case?')) {
                                                onDeleteTestCase(index);
                                                if (selectedTestCase >= testCases.length - 1) setSelectedTestCase(Math.max(0, testCases.length - 2));
                                            }
                                        }}
                                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Delete test case"
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {onAddTestCase && (
                            <button
                                onClick={() => { setShowAddForm(true); setEditingIndex(null); setFormInput(''); setFormOutput(''); setFormError(null); }}
                                className="px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 text-[#10B981] hover:bg-[#10B981]/10 border border-dashed border-[#10B981]/30 hover:border-[#10B981]/50"
                            >
                                <Plus size={12} /> Add
                            </button>
                        )}
                    </div>

                    {/* Add/Edit Form */}
                    {(showAddForm || editingIndex !== null) && (
                        <div className="bg-[#252526] rounded-xl p-3 border border-white/10 space-y-3 animate-fade-in flex flex-col min-h-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-white">
                                    {editingIndex !== null ? `Edit Test Case ${editingIndex + 1}` : 'Add Custom Test Case'}
                                </h3>
                                <button onClick={cancelEditing} className="p-1 text-[#666] hover:text-white transition-colors"><X size={16} /></button>
                            </div>
                            {formError && <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{formError}</div>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1 min-h-0">
                                <div className="flex flex-col min-h-0">
                                    <label className="text-[10px] md:text-xs font-medium text-[#888] mb-1.5 block uppercase tracking-wider">Input <span className="text-red-400">*</span></label>
                                    <textarea value={formInput} onChange={(e) => setFormInput(e.target.value)} placeholder="Enter test input..."
                                        className="w-full h-40 bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#10B981]/50 resize-none custom-scrollbar" />
                                </div>
                                <div className="flex flex-col min-h-0">
                                    <label className="text-[10px] md:text-xs font-medium text-[#888] mb-1.5 block uppercase tracking-wider">Expected Output <span className="text-[#555]">(optional)</span></label>
                                    <textarea value={formOutput} onChange={(e) => setFormOutput(e.target.value)} placeholder="Enter expected output..."
                                        className="w-full h-40 bg-[#1a1a1a] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#10B981]/50 resize-none custom-scrollbar" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={cancelEditing} className="px-4 py-2 text-xs font-medium text-[#888] hover:text-white transition-colors">Cancel</button>
                                <button onClick={editingIndex !== null ? handleUpdateTestCase : handleAddTestCase}
                                    className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <Save size={14} /> {editingIndex !== null ? 'Update' : 'Add Test Case'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Selected Test Case Details */}
                    {!showAddForm && editingIndex === null && testCases[selectedTestCase] && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 flex-1 min-h-0">
                            <div className="flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-medium text-[#888] uppercase tracking-wider">Input</label>
                                    {isCustomTestCase(selectedTestCase) && onUpdateTestCase && (
                                        <button onClick={() => startEditing(selectedTestCase)} className="p-1 text-[#666] hover:text-[#10B981] transition-colors" title="Edit test case"><Edit2 size={12} /></button>
                                    )}
                                </div>
                                <div className="bg-[#252526] rounded-lg p-2 border border-white/5 font-mono text-xs text-[#d4d4d4] whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar flex-1 min-h-[60px]">
                                    {testCases[selectedTestCase].input || <span className="italic text-[#555]">Empty input</span>}
                                </div>
                            </div>
                            <div className="flex flex-col min-h-0">
                                <label className="text-[10px] font-medium text-[#888] mb-1 block uppercase tracking-wider">Expected Output</label>
                                <div className="bg-[#252526] rounded-lg p-2 border border-white/5 font-mono text-xs text-[#d4d4d4] whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar flex-1 min-h-[60px]">
                                    {testCases[selectedTestCase].output || testCases[selectedTestCase].expectedOutput || <span className="italic text-[#555]">No expected output</span>}
                                </div>
                            </div>
                            <div className="flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-medium text-[#888] block uppercase tracking-wider">Actual Output</label>
                                    {result && result.results[selectedTestCase] && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.results[selectedTestCase].passed ? 'bg-[#10B981]/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {result.results[selectedTestCase].verdict}
                                        </span>
                                    )}
                                </div>
                                <div className={`bg-[#252526] rounded-lg p-2 border font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-y-auto custom-scrollbar flex-1 min-h-[60px] ${result && result.results[selectedTestCase]
                                    ? result.results[selectedTestCase].passed
                                        ? 'border-[#10B981]/20 text-[#d4d4d4]'
                                        : 'border-red-500/20 text-red-300'
                                    : 'border-white/5 text-[#666]'
                                }`}>
                                    {result && result.results[selectedTestCase]
                                        ? (result.results[selectedTestCase].output || <span className="italic opacity-50">No output</span>)
                                        : <span className="italic opacity-30">Run code to see output</span>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {testCases.length === 0 && !showAddForm && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><Play size={28} className="text-[#444]" /></div>
                            <p className="text-[#666] text-sm mb-4">No test cases available</p>
                            {onAddTestCase && (
                                <button onClick={() => { setShowAddForm(true); setFormInput(''); setFormOutput(''); }}
                                    className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 text-[#10B981] hover:bg-[#10B981]/10 border border-[#10B981]/30">
                                    <Plus size={14} /> Add Custom Test Case
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : activeTab === 'result' ? (
                result ? (
                    <div className="h-full flex flex-col space-y-2 animate-fade-in">
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${result.passed
                            ? 'bg-[#10B981]/10 border-[#10B981]/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            <div className={`p-2 rounded-full ${result.passed ? 'bg-[#10B981]/20' : 'bg-red-500/20'}`}>
                                {getVerdictIcon(result.verdict)}
                            </div>
                            <div>
                                <div className="font-bold text-lg">{result.verdict}</div>
                                <div className="text-xs opacity-70 mt-0.5 font-mono">{result.testsPassed}/{result.totalTests} tests passed {'\u2022'} {result.time || '0ms'}</div>
                            </div>
                        </div>

                        {result.results[0]?.compileError && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg overflow-hidden">
                                <div className="px-3 py-2 text-orange-400 text-xs font-medium border-b border-orange-500/20">Compilation Error</div>
                                <pre className="p-3 text-[10px] text-orange-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">{result.results[0].compileError}</pre>
                            </div>
                        )}
                        {result.results[0]?.runtimeError && !result.results[0]?.compileError && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg overflow-hidden">
                                <div className="px-3 py-2 text-purple-400 text-xs font-medium border-b border-purple-500/20">Runtime Error</div>
                                <pre className="p-3 text-[10px] text-purple-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">{result.results[0].runtimeError}</pre>
                            </div>
                        )}

                        <div className="bg-[#252526] rounded-xl border border-white/5 overflow-hidden">
                            {result.results.map((r) => (
                                <div key={r.testCase} className={`flex items-center justify-between p-3 text-xs border-b border-white/5 last:border-0 hover:bg-[#2d2d2d] transition-colors ${!r.passed ? 'bg-red-500/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        {r.passed ? <CheckCircle2 size={16} className="text-[#10B981]" /> : <XCircle size={16} className="text-red-500" />}
                                        <span className="font-medium text-[#d4d4d4]">Test Case {r.testCase}</span>
                                    </div>
                                    <div className="flex items-center gap-4 font-mono text-[#888]">
                                        <span>{r.time || '0ms'}</span>
                                        <span>{r.memory || '0KB'}</span>
                                        <span className={`font-bold w-12 text-right ${r.passed ? 'text-green-400' : 'text-red-400'}`}>{getVerdictShort(r.verdict)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#252526] flex items-center justify-center"><CloudUpload size={24} className="opacity-50" /></div>
                        <p className="text-sm font-medium">Run your code to see results</p>
                    </div>
                )
            ) : (
                renderCFStatus()
            )}
        </div>
    );
}
