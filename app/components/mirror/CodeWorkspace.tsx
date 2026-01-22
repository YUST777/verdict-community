import {
    Loader2,
    Play,
    ChevronDown
} from 'lucide-react';
import { Editor, OnMount } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { SubmissionResult, Example, CFSubmissionStatus } from './types';
import TestRunnerPanel from './TestRunnerPanel';

interface CodeWorkspaceProps {
    code: string;
    setCode: (code: string) => void;
    submitting: boolean;
    onSubmit: () => void;
    onRunTests?: () => void; // Optional: Run sample tests
    handleEditorDidMount: OnMount;
    isTestPanelVisible: boolean;
    setIsTestPanelVisible: (visible: boolean) => void;
    testPanelHeight: number;
    setTestPanelHeight: (height: number) => void;
    testCases: Example[];
    result: SubmissionResult | null;
    cfStatus: CFSubmissionStatus | null; // Codeforces submission status
    mobileView: 'problem' | 'code';
    language: string;
    setLanguage: (lang: string) => void;
    contestId?: string;
    problemId?: string;
    testPanelActiveTab?: 'testcase' | 'result' | 'codeforces';
    setTestPanelActiveTab?: (tab: 'testcase' | 'result' | 'codeforces') => void;
    // Custom test cases
    onAddTestCase?: (testCase: Example) => void;
    onDeleteTestCase?: (index: number) => void;
    onUpdateTestCase?: (index: number, testCase: Example) => void;
    sampleTestCasesCount?: number;
}

const SUPPORTED_LANGUAGES = [
    { id: 'cpp', name: 'C++', monaco: 'cpp' },
    { id: 'java', name: 'Java', monaco: 'java' },
    { id: 'python', name: 'Python', monaco: 'python' },
    { id: 'javascript', name: 'Node.js', monaco: 'javascript' },
    { id: 'csharp', name: 'C#', monaco: 'csharp' },
    { id: 'kotlin', name: 'Kotlin', monaco: 'kotlin' },
    { id: 'go', name: 'Go', monaco: 'go' },
    { id: 'rust', name: 'Rust', monaco: 'rust' }
];

const TEMPLATES: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(0); cin.tie(0);\n    \n    return 0;\n}`,
    java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}`,
    python: `import sys\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()`,
    javascript: `const readline = require('readline');\n\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    \n});`,
    csharp: `using System;\n\npublic class Program\n{\n    public static void Main()\n    {\n        \n    }\n}`,
    kotlin: `import java.util.Scanner\n\nfun main() {\n    val scanner = Scanner(System.` + `in` + `)\n    \n}`,
    go: `package main\n\nimport "fmt"\n\nfunc main() {\n    \n}`,
    rust: `use std::io;\n\nfn main() {\n    \n}`
};

export default function CodeWorkspace({
    code,
    setCode,
    submitting,
    onSubmit,
    onRunTests,
    handleEditorDidMount,
    isTestPanelVisible,
    setIsTestPanelVisible,
    testCases,
    result,
    cfStatus,
    mobileView,
    language,
    setLanguage,
    contestId,
    problemId,
    testPanelActiveTab,
    setTestPanelActiveTab,
    onAddTestCase,
    onDeleteTestCase,
    onUpdateTestCase,
    sampleTestCasesCount
}: Omit<CodeWorkspaceProps, 'testPanelHeight' | 'setTestPanelHeight'>) {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isResizingVertical, setIsResizingVertical] = useState(false);
    const [internalTab, setInternalTab] = useState<'testcase' | 'result' | 'codeforces'>('testcase');
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [isLangOpen, setIsLangOpen] = useState(false);

    // Use external tab control if provided, otherwise internal
    const testPanelTab = testPanelActiveTab ?? internalTab;
    const setTestPanelTab = setTestPanelActiveTab ?? setInternalTab;

    const handleLanguageChange = (langId: string) => {
        // Check if code has been modified from the template
        const currentTemplate = TEMPLATES[language];
        const isModified = code.trim() && (!currentTemplate || code.trim() !== currentTemplate.trim());

        if (isModified) {
            if (!window.confirm('Switching language will replace your current code. Continue?')) {
                setIsLangOpen(false);
                return;
            }
        }

        setLanguage(langId);
        setIsLangOpen(false);
        if (TEMPLATES[langId]) {
            setCode(TEMPLATES[langId]);
        }
    };

    // Internal ref for height to avoid re-renders
    const lastHeight = useRef(35);

    // Load saved height on mount
    useEffect(() => {
        const savedHeight = localStorage.getItem('verdict-layout-test-height');
        if (savedHeight && editorContainerRef.current) {
            const height = parseFloat(savedHeight);
            if (!isNaN(height) && height >= 15 && height <= 85) {
                lastHeight.current = height;
                editorContainerRef.current.style.setProperty('--test-panel-h', `${height}%`);
            }
        }
    }, []);

    // ResizeObserver for smooth Monaco layout
    useEffect(() => {
        if (!editorContainerRef.current || !wrapperRef.current) return;

        // Find the monaco editor instance (it might hide deep in the DOM)
        // Actually, we can use the handleEditorDidMount callback to save the editor instance locally
        // But for now, let's just observe the wrapper and rely on Monaco's internal observer if we use automaticLayout: false
        // Better: store the editor instance from onMount props intercept
    }, []);

    // Intercept onMount to get editor instance for manual layout
    const editorInstanceRef = useRef<Parameters<OnMount>[0] | null>(null);
    const onEditorMount: OnMount = (editor, monaco) => {
        editorInstanceRef.current = editor;
        handleEditorDidMount(editor, monaco);

        // Force layout after mount with multiple delays to handle container sizing
        // This fixes the blank editor issue
        requestAnimationFrame(() => {
            editor.layout();
        });
        setTimeout(() => {
            editor.layout();
        }, 100);
        setTimeout(() => {
            editor.layout();
        }, 500);
    };

    // Manual Layout Observer - handles resize events
    useEffect(() => {
        if (!wrapperRef.current) return;

        const observer = new ResizeObserver((entries) => {
            // Only layout if we have valid dimensions
            const entry = entries[0];
            if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.layout();
                }
            }
        });

        observer.observe(wrapperRef.current);

        // Also observe the editorContainerRef for when test panel toggles
        if (editorContainerRef.current) {
            observer.observe(editorContainerRef.current);
        }

        return () => {
            observer.disconnect();
            // Clear the editor reference to prevent operations on disposed editor
            editorInstanceRef.current = null;
        };
    }, []);

    // Force layout when test panel visibility changes
    useEffect(() => {
        if (editorInstanceRef.current) {
            // Delay to allow CSS transition to complete
            requestAnimationFrame(() => {
                editorInstanceRef.current?.layout();
            });
            setTimeout(() => {
                editorInstanceRef.current?.layout();
            }, 100);
        }
    }, [isTestPanelVisible]);

    // Auto-switch to result tab when result arrives
    useEffect(() => {
        if (result && isTestPanelVisible) {
            setTestPanelTab('result');
        }
    }, [result, isTestPanelVisible, setTestPanelTab]);

    const handleVerticalResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        setIsResizingVertical(true);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        let animationFrameId: number;

        const handleVerticalMove = (e: MouseEvent | TouchEvent) => {
            if (!isResizingVertical || !editorContainerRef.current) return;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!editorContainerRef.current) return;
                let clientY;
                if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
                    clientY = e.touches[0].clientY;
                } else {
                    clientY = (e as MouseEvent).clientY;
                }

                const containerRect = editorContainerRef.current.getBoundingClientRect();
                const newHeight = ((containerRect.bottom - clientY) / containerRect.height) * 100;

                if (newHeight >= 15 && newHeight <= 85) {
                    // Update CSS variable directly
                    editorContainerRef.current.style.setProperty('--test-panel-h', `${newHeight}%`);
                    lastHeight.current = newHeight;
                }
            });
        };

        const handleVerticalEnd = () => {
            setIsResizingVertical(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Save preference
            localStorage.setItem('verdict-layout-test-height', lastHeight.current.toString());

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        if (isResizingVertical) {
            document.addEventListener('mousemove', handleVerticalMove);
            document.addEventListener('mouseup', handleVerticalEnd);
            document.addEventListener('touchmove', handleVerticalMove, { passive: false });
            document.addEventListener('touchend', handleVerticalEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleVerticalMove);
            document.removeEventListener('mouseup', handleVerticalEnd);
            document.removeEventListener('touchmove', handleVerticalMove);
            document.removeEventListener('touchend', handleVerticalEnd);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isResizingVertical]);



    return (
        <div
            ref={editorContainerRef}
            className={`flex-1 flex flex-col bg-[#1e1e1e] min-w-0 min-h-0 ${mobileView === 'problem' ? 'hidden md:flex' : 'flex'}`}
            style={{
                cursor: isResizingVertical ? 'row-resize' : 'auto',
                '--test-panel-h': '35%'
            } as React.CSSProperties}
        >
            {/* Editor Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a1a1a] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 relative">
                        <span className="text-xs sm:text-sm font-medium text-white hidden xs:inline">Code</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-2 py-1.5 sm:py-0.5 bg-white/10 rounded text-[#A0A0A0] active:text-white transition-colors border border-transparent active:border-white/10 touch-manipulation min-h-[32px]"
                            >
                                <span className="max-w-[60px] sm:max-w-none truncate">{SUPPORTED_LANGUAGES.find(l => l.id === language)?.name || 'C++'}</span>
                                <ChevronDown size={10} className="sm:w-3 sm:h-3 shrink-0" />
                            </button>
                            {isLangOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1 w-40 bg-[#252526] border border-white/10 rounded-lg shadow-xl z-50 py-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-500">
                                        {SUPPORTED_LANGUAGES.map(lang => (
                                            <button
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang.id)}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 hover:text-white transition-colors ${language === lang.id ? 'text-[#34D399] bg-white/5' : 'text-[#A0A0A0]'}`}
                                            >
                                                {lang.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={() => {
                            if (onRunTests) {
                                onRunTests();
                            } else {
                                setIsTestPanelVisible(!isTestPanelVisible);
                            }
                        }}
                        disabled={submitting}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation min-h-[32px] ${isTestPanelVisible
                            ? 'bg-white/10 text-white border-white/20'
                            : 'text-[#888] border-transparent active:text-white active:bg-white/5'
                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Test your code locally with sample test cases"
                    >
                        {submitting ? (
                            <Loader2 size={12} className="sm:w-[14px] sm:h-[14px] animate-spin" />
                        ) : (
                            <Play size={12} className="sm:w-[14px] sm:h-[14px]" />
                        )}
                        <span className="hidden xs:inline">{submitting ? 'Testing...' : 'Test Locally'}</span>
                        <span className="xs:hidden">{submitting ? '...' : 'Test'}</span>
                    </button>

                    <button
                        onClick={onSubmit}
                        disabled={submitting || !code.trim()}
                        className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] active:from-[#34D399] active:to-[#10B981] disabled:from-[#333] disabled:to-[#333] disabled:text-[#666] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs touch-manipulation min-h-[32px]"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={12} className="sm:w-4 sm:h-4 animate-spin" />
                                <span className="hidden xs:inline">Running...</span>
                                <span className="xs:hidden">...</span>
                            </>
                        ) : (
                            <>
                                <img 
                                    src="https://codeforces.org/s/0/favicon-32x32.png" 
                                    alt="CF" 
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 brightness-0 invert object-contain"
                                    style={{ imageRendering: 'crisp-edges' }}
                                />
                                <span>Submit</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div
                ref={wrapperRef}
                className="relative min-h-0"
                style={{
                    flex: isTestPanelVisible ? `1 1 calc(100% - var(--test-panel-h))` : '1 1 100%'
                }}
            >
                <div className="absolute inset-0">
                    <Editor
                        height="100%"
                        defaultLanguage="cpp"
                        language={SUPPORTED_LANGUAGES.find(l => l.id === language)?.monaco || 'cpp'}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={onEditorMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: false, // Critical: We handle this manually for performance
                            padding: { top: 4, bottom: 4 },
                            lineHeight: 22,
                            fontLigatures: true,
                            lineNumbers: 'on',
                            renderLineHighlight: 'all',
                            suggest: {
                                filterGraceful: false,
                                matchOnWordStartOnly: true,
                                showWords: true,
                                insertMode: 'replace',
                            },
                            quickSuggestions: {
                                other: true,
                                comments: false,
                                strings: false
                            },
                        }}
                        loading={
                            <div className="flex items-center justify-center h-full text-[#666]">
                                Loading Editor...
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Test Panel Section */}
            {isTestPanelVisible && (
                <TestRunnerPanel
                    height="var(--test-panel-h)"
                    activeTab={testPanelTab}
                    setActiveTab={setTestPanelTab}
                    selectedTestCase={selectedTestCase}
                    setSelectedTestCase={setSelectedTestCase}
                    testCases={testCases}
                    result={result}
                    cfStatus={cfStatus}
                    onClose={() => setIsTestPanelVisible(false)}
                    onResizeStart={handleVerticalResizeStart}
                    contestId={contestId}
                    problemId={problemId}
                    onAddTestCase={onAddTestCase}
                    onDeleteTestCase={onDeleteTestCase}
                    onUpdateTestCase={onUpdateTestCase}
                    sampleTestCasesCount={sampleTestCasesCount}
                />
            )}
        </div>
    );
}
