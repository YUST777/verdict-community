import { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Play,
    Minimize2,
    CloudUpload,
    Clock,
    Database,
    Loader2,
    ExternalLink,
    Send,
    Plus,
    Edit2,
    Save,
    X
} from 'lucide-react';
import { SubmissionResult, Example, CFSubmissionStatus, customTestCaseSchema } from './types';

interface TestRunnerPanelProps {
    height: string;
    activeTab: 'testcase' | 'result' | 'codeforces';
    setActiveTab: (tab: 'testcase' | 'result' | 'codeforces') => void;
    selectedTestCase: number;
    setSelectedTestCase: (index: number) => void;
    testCases: Example[];
    result: SubmissionResult | null;
    cfStatus: CFSubmissionStatus | null;
    onClose: () => void;
    onResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
    contestId?: string;
    problemId?: string;
    // Custom test cases
    onAddTestCase?: (testCase: Example) => void;
    onDeleteTestCase?: (index: number) => void;
    onUpdateTestCase?: (index: number, testCase: Example) => void;
    sampleTestCasesCount?: number; // Number of sample (non-deletable) test cases
}

export default function TestRunnerPanel({
    height,
    activeTab,
    setActiveTab,
    selectedTestCase,
    setSelectedTestCase,
    testCases,
    result,
    cfStatus,
    onClose,
    onResizeStart,
    contestId,
    problemId,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    sampleTestCasesCount = 0
}: TestRunnerPanelProps) {
    // Custom test case form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formInput, setFormInput] = useState('');
    const [formOutput, setFormOutput] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const handleAddTestCase = () => {
        setFormError(null);
        
        // Validate with Zod
        const result = customTestCaseSchema.safeParse({
            input: formInput,
            output: formOutput
        });

        if (!result.success) {
            setFormError(result.error.errors[0]?.message || 'Invalid input');
            return;
        }

        const newTestCase: Example = {
            input: formInput.trim(),
            output: formOutput.trim(),
            expectedOutput: formOutput.trim(),
            isCustom: true
        };

        if (onAddTestCase) {
            onAddTestCase(newTestCase);
        }

        // Reset form
        setFormInput('');
        setFormOutput('');
        setShowAddForm(false);
    };

    const handleUpdateTestCase = () => {
        if (editingIndex === null) return;
        setFormError(null);

        // Validate with Zod
        const result = customTestCaseSchema.safeParse({
            input: formInput,
            output: formOutput
        });

        if (!result.success) {
            setFormError(result.error.errors[0]?.message || 'Invalid input');
            return;
        }

        const updatedTestCase: Example = {
            input: formInput.trim(),
            output: formOutput.trim(),
            expectedOutput: formOutput.trim(),
            isCustom: true
        };

        if (onUpdateTestCase) {
            onUpdateTestCase(editingIndex, updatedTestCase);
        }

        // Reset form
        setFormInput('');
        setFormOutput('');
        setEditingIndex(null);
    };

    const startEditing = (index: number) => {
        const tc = testCases[index];
        setFormInput(tc.input);
        setFormOutput(tc.output || tc.expectedOutput || '');
        setEditingIndex(index);
        setShowAddForm(false);
        setFormError(null);
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setShowAddForm(false);
        setFormInput('');
        setFormOutput('');
        setFormError(null);
    };

    const isCustomTestCase = (index: number) => {
        return index >= sampleTestCasesCount || testCases[index]?.isCustom;
    };

    const getVerdictIcon = (verdict: string) => {
        if (verdict === 'Accepted' || verdict === 'OK') return <CheckCircle2 size={18} className="text-green-400" />;
        if (verdict.includes('Wrong')) return <XCircle size={18} className="text-red-400" />;
        if (verdict.includes('Time')) return <Clock size={18} className="text-yellow-400" />;
        if (verdict.includes('Memory')) return <Database size={18} className="text-blue-400" />;
        if (verdict.includes('Testing') || verdict.includes('Running')) return <Loader2 size={18} className="text-blue-400 animate-spin" />;
        if (verdict.includes('Queue') || verdict === 'Submitted') return <Loader2 size={18} className="text-gray-400 animate-spin" />;
        if (verdict.includes('Timeout')) return <Clock size={18} className="text-orange-400" />;
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
        if (verdict.includes('Testing') || verdict.includes('Running')) return 'RUN';
        if (verdict.includes('Queue') || verdict === 'Submitted') return '...';
        if (verdict.includes('Timeout')) return 'T/O';
        return verdict.slice(0, 3).toUpperCase();
    };

    const getCFStatusColor = () => {
        if (!cfStatus) return 'text-[#666]';
        switch (cfStatus.status) {
            case 'submitting': return 'text-blue-400';
            case 'waiting': return 'text-yellow-400';
            case 'testing': return 'text-blue-400';
            case 'done':
                return cfStatus.verdict === 'OK' || cfStatus.verdict === 'Accepted' 
                    ? 'text-green-400' 
                    : 'text-red-400';
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
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-white/5 border-white/10';
        }
    };

    const renderCFStatus = () => {
        if (!cfStatus || cfStatus.status === 'idle') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                        <img 
                            src="https://codeforces.org/s/0/favicon-32x32.png" 
                            alt="CF" 
                            className="w-6 h-6 opacity-50"
                        />
                    </div>
                    <p className="text-sm font-medium">Submit to Codeforces to see results</p>
                    <p className="text-xs text-[#555]">Use the Submit button above</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-fade-in">
                {/* Captcha Required Warning */}
                {cfStatus.needsCaptcha && (
                    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-orange-500/10 border-orange-500/20 text-orange-400">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500/20">
                                <XCircle size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-lg">Captcha Required</div>
                                <div className="text-xs opacity-70 mt-0.5">
                                    Codeforces requires you to verify you&apos;re human
                                </div>
                            </div>
                        </div>
                        <div className="bg-orange-500/10 rounded-lg p-3 text-xs text-orange-300">
                            <p className="mb-2">Please follow these steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-orange-200">
                                <li>Click the button below to open Codeforces</li>
                                <li>Complete the captcha verification</li>
                                <li>Come back and click Submit again</li>
                            </ol>
                        </div>
                        {cfStatus.captchaUrl && (
                            <a
                                href={cfStatus.captchaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
                            >
                                <img 
                                    src="https://codeforces.org/s/0/favicon-32x32.png" 
                                    alt="CF" 
                                    className="w-4 h-4"
                                />
                                Open Codeforces & Solve Captcha
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                )}

                {/* Duplicate Submission Warning */}
                {cfStatus.isDuplicate && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                        <div className="p-2 rounded-full bg-yellow-500/20">
                            <XCircle size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lg">Duplicate Submission</div>
                            <div className="text-xs opacity-70 mt-0.5">
                                You have submitted exactly the same code before!
                            </div>
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
                                {cfStatus.status === 'submitting' && 'Submitting to Codeforces...'}
                                {cfStatus.status === 'waiting' && 'In Queue...'}
                                {cfStatus.status === 'testing' && `Testing on test ${cfStatus.testNumber || '?'}...`}
                                {cfStatus.status === 'done' && (cfStatus.verdict || 'Done')}
                                {cfStatus.status === 'error' && (cfStatus.error || 'Submission Failed')}
                            </div>
                            <div className="text-xs opacity-70 mt-0.5 font-mono">
                                {cfStatus.status === 'done' && cfStatus.time !== undefined && cfStatus.memory !== undefined && (
                                    <>{cfStatus.time} ms • {Math.round(cfStatus.memory / 1024)} KB</>
                                )}
                                {cfStatus.status === 'testing' && cfStatus.testNumber && (
                                    <>Running test {cfStatus.testNumber}...</>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Failed Test Case Info */}
                {cfStatus.status === 'done' && cfStatus.failedTestCase && cfStatus.verdict !== 'Accepted' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <XCircle size={16} />
                            <span className="font-semibold text-sm">Failed on Test {cfStatus.failedTestCase}</span>
                        </div>
                        <div className="text-xs text-[#888]">
                            {cfStatus.testNumber !== undefined && cfStatus.testNumber > 0 && (
                                <span>Passed {cfStatus.testNumber} test{cfStatus.testNumber !== 1 ? 's' : ''} before failing</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Accepted - All Tests Passed */}
                {cfStatus.status === 'done' && cfStatus.verdict === 'Accepted' && cfStatus.testNumber && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={16} />
                            <span className="font-semibold text-sm">All {cfStatus.testNumber} tests passed!</span>
                        </div>
                    </div>
                )}

                {/* Compilation Error Details */}
                {cfStatus.compilationError && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 text-orange-400 text-xs font-medium border-b border-orange-500/20">
                            Compilation Error
                        </div>
                        <pre className="p-3 text-[10px] text-orange-300 max-h-40 overflow-auto whitespace-pre-wrap font-mono">
                            {cfStatus.compilationError}
                        </pre>
                    </div>
                )}

                {/* Submission ID & Link */}
                {cfStatus.submissionId && (
                    <div className="flex items-center justify-between p-3 bg-[#252526] rounded-lg border border-white/5">
                        <div className="text-xs text-[#888]">
                            Submission ID: <span className="text-white font-mono">#{cfStatus.submissionId}</span>
                        </div>
                        <a
                            href={`https://codeforces.com/contest/${contestId}/submission/${cfStatus.submissionId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-[#10B981] hover:text-[#34D399] transition-colors"
                        >
                            View on Codeforces
                            <ExternalLink size={12} />
                        </a>
                    </div>
                )}

                {/* Quick Links */}
                {contestId && problemId && (
                    <div className="flex gap-2">
                        <a
                            href={`https://codeforces.com/contest/${contestId}/my`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#252526] hover:bg-[#2d2d2d] rounded-lg border border-white/5 text-xs text-[#888] hover:text-white transition-colors"
                        >
                            My Submissions
                            <ExternalLink size={10} />
                        </a>
                        <a
                            href={`https://codeforces.com/contest/${contestId}/status/${problemId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 p-2 bg-[#252526] hover:bg-[#2d2d2d] rounded-lg border border-white/5 text-xs text-[#888] hover:text-white transition-colors"
                        >
                            All Submissions
                            <ExternalLink size={10} />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Vertical Resizer Bar */}
            <div
                className="h-1.5 bg-[#1a1a1a] hover:bg-[#10B981]/50 cursor-row-resize transition-colors relative group shrink-0 border-y border-white/5 active:bg-[#10B981]/50 touch-none"
                onMouseDown={onResizeStart}
                onTouchStart={onResizeStart}
            >
                <div className="absolute inset-x-0 -top-1 -bottom-1" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-white/20 rounded-full group-hover:bg-[#10B981]/50 transition-colors" />
            </div>

            {/* Test Case Panel Content */}
            <div
                className="bg-[#1a1a1a] flex flex-col min-h-0 shrink-0"
                style={{ height }}
            >
                {/* Headers */}
                <div className="flex items-center justify-between border-b border-white/10 shrink-0 px-2 bg-[#252526]">
                    <div className="flex items-center">
                        <button
                            onClick={() => setActiveTab('testcase')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'testcase'
                                ? 'text-white border-t-[#10B981] bg-[#1e1e1e]'
                                : 'text-[#666] hover:text-[#A0A0A0]'
                                }`}
                        >
                            <CheckCircle2 size={12} />
                            Testcase
                        </button>
                        <button
                            onClick={() => setActiveTab('result')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'result'
                                ? 'text-white border-t-[#10B981] bg-[#1e1e1e]'
                                : 'text-[#666] hover:text-[#A0A0A0]'
                                }`}
                        >
                            <Play size={12} />
                            Test Result
                        </button>
                        <button
                            onClick={() => setActiveTab('codeforces')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'codeforces'
                                ? 'text-white border-t-[#10B981] bg-[#1e1e1e]'
                                : 'text-[#666] hover:text-[#A0A0A0]'
                                }`}
                        >
                            {cfStatus && cfStatus.status !== 'idle' ? (
                                cfStatus.status === 'done' ? (
                                    cfStatus.verdict === 'OK' || cfStatus.verdict === 'Accepted' ? (
                                        <CheckCircle2 size={12} className="text-green-400" />
                                    ) : (
                                        <XCircle size={12} className="text-red-400" />
                                    )
                                ) : (
                                    <Loader2 size={12} className="animate-spin text-blue-400" />
                                )
                            ) : (
                                <img 
                                    src="https://codeforces.org/s/0/favicon-32x32.png" 
                                    alt="CF" 
                                    className="w-3 h-3"
                                />
                            )}
                            Codeforces
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-[#666] hover:text-white transition-colors"
                    >
                        <Minimize2 size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e1e]">
                    {activeTab === 'testcase' ? (
                        <>
                            {/* Case Tabs with Add Button */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                {testCases.map((tc, index) => (
                                    <div key={index} className="relative group">
                                        <button
                                            onClick={() => {
                                                setSelectedTestCase(index);
                                                cancelEditing();
                                            }}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${selectedTestCase === index
                                                ? 'bg-[#2d2d2d] text-white shadow-sm'
                                                : 'text-[#666] hover:text-[#A0A0A0] hover:bg-[#2d2d2d]/50'
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
                                        {/* Delete button for custom test cases */}
                                        {isCustomTestCase(index) && onDeleteTestCase && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Delete this test case?')) {
                                                        onDeleteTestCase(index);
                                                        if (selectedTestCase >= testCases.length - 1) {
                                                            setSelectedTestCase(Math.max(0, testCases.length - 2));
                                                        }
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
                                
                                {/* Add Test Case Button */}
                                {onAddTestCase && (
                                    <button
                                        onClick={() => {
                                            setShowAddForm(true);
                                            setEditingIndex(null);
                                            setFormInput('');
                                            setFormOutput('');
                                            setFormError(null);
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 text-[#10B981] hover:bg-[#10B981]/10 border border-dashed border-[#10B981]/30 hover:border-[#10B981]/50"
                                    >
                                        <Plus size={12} />
                                        Add
                                    </button>
                                )}
                            </div>

                            {/* Add/Edit Form */}
                            {(showAddForm || editingIndex !== null) && (
                                <div className="bg-[#252526] rounded-xl p-4 border border-white/10 space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-white">
                                            {editingIndex !== null ? `Edit Test Case ${editingIndex + 1}` : 'Add Custom Test Case'}
                                        </h3>
                                        <button
                                            onClick={cancelEditing}
                                            className="p-1 text-[#666] hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {formError && (
                                        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                            {formError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-[#888] mb-2 block uppercase tracking-wider">
                                                Input <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                value={formInput}
                                                onChange={(e) => setFormInput(e.target.value)}
                                                placeholder="Enter test input..."
                                                className="w-full h-32 bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-sm font-mono text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#10B981]/50 resize-none scrollbar-thin scrollbar-thumb-white/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[#888] mb-2 block uppercase tracking-wider">
                                                Expected Output <span className="text-[#555]">(optional)</span>
                                            </label>
                                            <textarea
                                                value={formOutput}
                                                onChange={(e) => setFormOutput(e.target.value)}
                                                placeholder="Enter expected output..."
                                                className="w-full h-32 bg-[#1e1e1e] border border-white/10 rounded-lg p-3 text-sm font-mono text-[#d4d4d4] placeholder-[#555] focus:outline-none focus:border-[#10B981]/50 resize-none scrollbar-thin scrollbar-thumb-white/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={cancelEditing}
                                            className="px-4 py-2 text-xs font-medium text-[#888] hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={editingIndex !== null ? handleUpdateTestCase : handleAddTestCase}
                                            className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Save size={14} />
                                            {editingIndex !== null ? 'Update' : 'Add Test Case'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Selected Test Case Details */}
                            {!showAddForm && editingIndex === null && testCases[selectedTestCase] && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-[#888] uppercase tracking-wider">Input</label>
                                            {isCustomTestCase(selectedTestCase) && onUpdateTestCase && (
                                                <button
                                                    onClick={() => startEditing(selectedTestCase)}
                                                    className="p-1 text-[#666] hover:text-[#10B981] transition-colors"
                                                    title="Edit test case"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-[#2d2d2d] rounded-lg p-3 border border-white/5 font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 flex-1">
                                            {testCases[selectedTestCase].input || <span className="italic text-[#555]">Empty input</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs font-medium text-[#888] mb-2 block uppercase tracking-wider">Expected Output</label>
                                        <div className="bg-[#2d2d2d] rounded-lg p-3 border border-white/5 font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 flex-1">
                                            {testCases[selectedTestCase].output || testCases[selectedTestCase].expectedOutput || <span className="italic text-[#555]">No expected output</span>}
                                        </div>
                                    </div>

                                    {/* Actual Output */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-[#888] block uppercase tracking-wider">Actual Output</label>
                                            {result && result.results[selectedTestCase] && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.results[selectedTestCase].passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {result.results[selectedTestCase].verdict}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`bg-[#2d2d2d] rounded-lg p-3 border font-mono text-sm whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 flex-1 ${result && result.results[selectedTestCase]
                                            ? result.results[selectedTestCase].passed
                                                ? 'border-green-500/20 text-[#d4d4d4]'
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
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Play size={28} className="text-[#444]" />
                                    </div>
                                    <p className="text-[#666] text-sm mb-4">No test cases available</p>
                                    {onAddTestCase && (
                                        <button
                                            onClick={() => {
                                                setShowAddForm(true);
                                                setFormInput('');
                                                setFormOutput('');
                                            }}
                                            className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-2 text-[#10B981] hover:bg-[#10B981]/10 border border-[#10B981]/30"
                                        >
                                            <Plus size={14} />
                                            Add Custom Test Case
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'result' ? (
                        /* Result Tab */
                        result ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.passed
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    <div className={`p-2 rounded-full ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                        {getVerdictIcon(result.verdict)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{result.verdict}</div>
                                        <div className="text-xs opacity-70 mt-0.5 font-mono">
                                            {result.testsPassed}/{result.totalTests} tests passed • {result.time || '0ms'}
                                        </div>
                                    </div>
                                </div>

                                {/* Compile / Runtime Error */}
                                {result.results[0]?.compileError && (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 text-orange-400 text-xs font-medium border-b border-orange-500/20">Compilation Error</div>
                                        <pre className="p-3 text-[10px] text-orange-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">
                                            {result.results[0].compileError}
                                        </pre>
                                    </div>
                                )}
                                {result.results[0]?.runtimeError && !result.results[0]?.compileError && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 text-purple-400 text-xs font-medium border-b border-purple-500/20">Runtime Error</div>
                                        <pre className="p-3 text-[10px] text-purple-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">
                                            {result.results[0].runtimeError}
                                        </pre>
                                    </div>
                                )}

                                <div className="bg-[#252526] rounded-xl border border-white/5 overflow-hidden">
                                    {result.results.map((r) => (
                                        <div key={r.testCase} className={`flex items-center justify-between p-3 text-xs border-b border-white/5 last:border-0 hover:bg-[#2d2d2d] transition-colors ${!r.passed ? 'bg-red-500/5' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                {r.passed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                                <span className="font-medium text-[#d4d4d4]">Test Case {r.testCase}</span>
                                            </div>
                                            <div className="flex items-center gap-4 font-mono text-[#888]">
                                                <span>{r.time || '0ms'}</span>
                                                <span>{r.memory || '0KB'}</span>
                                                <span className={`font-bold w-12 text-right ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                    {getVerdictShort(r.verdict)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                                    <CloudUpload size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Run your code to see results</p>
                            </div>
                        )
                    ) : (
                        /* Codeforces Tab */
                        renderCFStatus()
                    )}
                </div>
            </div>
        </>
    );
}

