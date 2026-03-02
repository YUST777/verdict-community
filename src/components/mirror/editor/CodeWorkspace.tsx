import { Wand2, MessageSquarePlus, Copy, Check, CheckCircle2, Play, XCircle, Loader2, GripHorizontal } from 'lucide-react';
import { Editor, OnMount } from '@monaco-editor/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { SubmissionResult, Example, CFSubmissionStatus } from '../shared/types';
import TestRunnerPanel from '../test/TestRunnerPanel';
import EditorToolbar from './EditorToolbar';
import AskAIButton from './AskAIButton';
import { useVerticalResize } from './useVerticalResize';
import { SUPPORTED_LANGUAGES, TEMPLATES, getLanguageById } from './EditorConstants';

const PANEL_TAB_BAR_HEIGHT = 42; // px - height of the tab bar + grip area
const DEFAULT_PANEL_PERCENT = 35; // default expanded panel height as % of container
const MIN_PANEL_PERCENT = 0; // fully collapsed = just tab bar
const MAX_PANEL_PERCENT = 85;
const SNAP_THRESHOLD = 5; // if dragged below this %, snap to 0

interface CodeWorkspaceProps {
    code: string;
    setCode: (code: string) => void;
    submitting: boolean;
    onSubmit: () => void;
    onRunTests?: () => void;
    handleEditorDidMount: OnMount;
    isTestPanelVisible: boolean;
    setIsTestPanelVisible: (visible: boolean) => void;
    testPanelHeight: number;
    setTestPanelHeight: (height: number) => void;
    testCases: Example[];
    result: SubmissionResult | null;
    cfStatus: CFSubmissionStatus | null;
    mobileView: 'problem' | 'code';
    language: string;
    setLanguage: (lang: string) => void;
    contestId?: string;
    problemId?: string;
    testPanelActiveTab?: 'testcase' | 'result' | 'codeforces';
    setTestPanelActiveTab?: (tab: 'testcase' | 'result' | 'codeforces') => void;
    onAddTestCase?: (testCase: Example) => void;
    onDeleteTestCase?: (index: number) => void;
    onUpdateTestCase?: (index: number, testCase: Example) => void;
    sampleTestCasesCount?: number;
    aiCode?: string;
    activeTab?: 'human' | 'ai';
    setActiveTab?: (tab: 'human' | 'ai') => void;
    onAskAboutCode?: (selectedCode: string, question?: string) => void;
    onExplainLine?: (lineNumber: number, code: string) => void;
    onExplainFunction?: (functionCode: string) => void;
    onOptimizeCode?: (code: string) => void;
    onFindBugs?: (code: string) => void;
    activeLeftPanelTab?: string;
}

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
    sampleTestCasesCount,
    aiCode = '',
    activeTab: externalActiveTab,
    setActiveTab: setExternalActiveTab,
    onAskAboutCode,
    onExplainLine,
    onExplainFunction,
    onOptimizeCode,
    onFindBugs,
    activeLeftPanelTab
}: Omit<CodeWorkspaceProps, 'testPanelHeight' | 'setTestPanelHeight'>) {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isResizingVertical, setIsResizingVertical] = useState(false);
    const [panelContentPercent, setPanelContentPercent] = useState(0); // 0 = collapsed
    const [isAnimating, setIsAnimating] = useState(false); // for smooth open/close transitions
    const savedHeightRef = useRef(DEFAULT_PANEL_PERCENT);
    const [internalTab, setInternalTab] = useState<'testcase' | 'result' | 'codeforces'>('testcase');
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [internalCodeTab, setInternalCodeTab] = useState<'human' | 'ai'>('human');
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
    const [showAskAIButton, setShowAskAIButton] = useState(false);
    const [selectionLineNumbers, setSelectionLineNumbers] = useState<{ start: number; end: number } | null>(null);
    const askAIButtonRef = useRef<HTMLDivElement>(null);
    const [isCopied, setIsCopied] = useState(false);

    const codeTab = externalActiveTab ?? internalCodeTab;
    const setCodeTab = setExternalActiveTab ?? setInternalCodeTab;
    const displayCode = codeTab === 'ai' ? aiCode : code;
    const isReadOnly = codeTab === 'ai';

    const codeTabRef = useRef(codeTab);
    const isReadOnlyRef = useRef(isReadOnly);
    codeTabRef.current = codeTab;
    isReadOnlyRef.current = isReadOnly;

    useEffect(() => {
        codeTabRef.current = codeTab;
    }, [codeTab]);

    const testPanelTab = testPanelActiveTab ?? internalTab;
    const setTestPanelTab = setTestPanelActiveTab ?? setInternalTab;

    const handleLanguageChange = (langId: string) => {
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

    // Load saved height on mount
    useEffect(() => {
        const savedHeight = localStorage.getItem('verdict-layout-test-height');
        if (savedHeight) {
            const height = parseFloat(savedHeight);
            if (!isNaN(height) && height >= 15 && height <= MAX_PANEL_PERCENT) {
                savedHeightRef.current = height;
            }
        }
    }, []);

    // Sync isTestPanelVisible with panelContentPercent
    // When hooks call setIsTestPanelVisible(true), expand the panel
    useEffect(() => {
        if (isTestPanelVisible && panelContentPercent === 0) {
            setIsAnimating(true);
            setPanelContentPercent(savedHeightRef.current);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [isTestPanelVisible]);

    // Keep isTestPanelVisible in sync with panel state
    useEffect(() => {
        if (panelContentPercent > 0 && !isTestPanelVisible) {
            setIsTestPanelVisible(true);
        } else if (panelContentPercent === 0 && isTestPanelVisible) {
            setIsTestPanelVisible(false);
        }
    }, [panelContentPercent]);

    // Expand/collapse helpers
    const expandPanel = useCallback((tab?: 'testcase' | 'result' | 'codeforces') => {
        if (tab) setTestPanelTab(tab);
        if (panelContentPercent === 0) {
            setIsAnimating(true);
            setPanelContentPercent(savedHeightRef.current);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [panelContentPercent, setTestPanelTab]);

    const collapsePanel = useCallback(() => {
        if (panelContentPercent > 0) {
            savedHeightRef.current = panelContentPercent;
            localStorage.setItem('verdict-layout-test-height', panelContentPercent.toString());
            setIsAnimating(true);
            setPanelContentPercent(0);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [panelContentPercent]);

    const togglePanel = useCallback(() => {
        if (panelContentPercent === 0) {
            expandPanel();
        } else {
            collapsePanel();
        }
    }, [panelContentPercent, expandPanel, collapsePanel]);

    // Tab click handler
    const handleTabClick = useCallback((tab: 'testcase' | 'result' | 'codeforces') => {
        if (panelContentPercent === 0) {
            expandPanel(tab);
        } else {
            setTestPanelTab(tab);
        }
    }, [panelContentPercent, expandPanel, setTestPanelTab]);

    // Monaco resize observer
    const editorInstanceRef = useRef<Parameters<OnMount>[0] | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !wrapperRef.current) return;
        const observer = new ResizeObserver(() => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.layout();
            }
        });
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, []);

    const onEditorMount: OnMount = (editor, monacoEditor) => {
        editorInstanceRef.current = editor;
        handleEditorDidMount(editor, monacoEditor);

        requestAnimationFrame(() => editor.layout());
        setTimeout(() => editor.layout(), 100);
        setTimeout(() => editor.layout(), 500);

        editor.onDidChangeCursorSelection(() => {
            requestAnimationFrame(() => {
                const selection = editor.getSelection();
                if (selection && !selection.isEmpty()) {
                    const selectedText = editor.getModel()?.getValueInRange(selection) || '';
                    if (selectedText.trim().length > 0 && selectedText.trim().length < 10000) {
                        setSelectedCode(selectedText);
                        const startLine = selection.startLineNumber;
                        const endLine = selection.endLineNumber;
                        setSelectionLineNumbers({ start: startLine, end: endLine });

                        const editorDom = editor.getDomNode();
                        if (editorDom) {
                            const rect = editorDom.getBoundingClientRect();
                            const endPosition = selection.getEndPosition();
                            const coords = editor.getScrolledVisiblePosition(endPosition);
                            if (coords) {
                                const lineHeight = 22;
                                const fontSize = 13;
                                const charWidth = fontSize * 0.6;
                                const contentLeft = editor.getLayoutInfo().contentLeft;
                                const top = rect.top + coords.top + lineHeight + 5;
                                const left = rect.left + contentLeft + coords.left + (charWidth * 2);
                                const buttonWidth = 200;
                                const maxLeft = rect.right - buttonWidth - 10;
                                const finalLeft = Math.max(rect.left + 10, Math.min(left, maxLeft));
                                const buttonHeight = 36;
                                const maxTop = rect.bottom - buttonHeight - 10;
                                const finalTop = Math.max(rect.top + 10, Math.min(top, maxTop));
                                setSelectionPosition({ top: finalTop, left: finalLeft });
                                setShowAskAIButton(true);
                            }
                        }
                    } else {
                        setShowAskAIButton(false);
                        setSelectedCode('');
                        setSelectionLineNumbers(null);
                    }
                } else {
                    setShowAskAIButton(false);
                    setSelectedCode('');
                    setSelectionLineNumbers(null);
                }
            });
        });

        editor.onMouseDown(() => {
            setTimeout(() => {
                const selection = editor.getSelection();
                if (!selection || selection.isEmpty()) {
                    setShowAskAIButton(false);
                }
            }, 100);
        });
    };

    // Layout observer
    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                if (editorInstanceRef.current) {
                    editorInstanceRef.current.layout();
                }
            }
        });
        observer.observe(wrapperRef.current);
        if (editorContainerRef.current) {
            observer.observe(editorContainerRef.current);
        }
        return () => {
            observer.disconnect();
            editorInstanceRef.current = null;
        };
    }, []);

    // Force layout on panel height change
    useEffect(() => {
        if (editorInstanceRef.current) {
            requestAnimationFrame(() => {
                editorInstanceRef.current?.layout();
            });
            setTimeout(() => {
                editorInstanceRef.current?.layout();
            }, 100);
            // Extra layout after animation completes
            if (isAnimating) {
                setTimeout(() => {
                    editorInstanceRef.current?.layout();
                }, 350);
            }
        }
    }, [panelContentPercent, isAnimating]);

    // Auto-switch to result tab when result arrives
    useEffect(() => {
        if (result && panelContentPercent > 0) {
            setTestPanelTab('result');
        }
    }, [result, panelContentPercent, setTestPanelTab]);

    // --- DRAG RESIZE LOGIC ---
    const handleGripMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        setIsResizingVertical(true);
        setIsAnimating(false); // disable transitions during drag
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const handleVerticalMove = (e: MouseEvent | TouchEvent) => {
            if (!isResizingVertical || !editorContainerRef.current) return;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!editorContainerRef.current) return;
                let clientY: number;
                if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
                    clientY = e.touches[0].clientY;
                } else {
                    clientY = (e as MouseEvent).clientY;
                }

                const containerRect = editorContainerRef.current.getBoundingClientRect();
                // Calculate how much of the container the panel should take (from bottom)
                // Subtract the tab bar height since it's always visible
                const totalHeight = containerRect.height;
                const distFromBottom = containerRect.bottom - clientY;
                // The panel percent is the content area only (excluding the fixed tab bar)
                const tabBarFraction = (PANEL_TAB_BAR_HEIGHT / totalHeight) * 100;
                const newPercent = ((distFromBottom / totalHeight) * 100) - tabBarFraction;

                if (newPercent <= SNAP_THRESHOLD) {
                    setPanelContentPercent(0);
                } else if (newPercent >= MAX_PANEL_PERCENT) {
                    setPanelContentPercent(MAX_PANEL_PERCENT);
                } else {
                    setPanelContentPercent(newPercent);
                }
            });
        };

        const handleVerticalEnd = () => {
            setIsResizingVertical(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Save if expanded
            if (panelContentPercent > 0) {
                savedHeightRef.current = panelContentPercent;
                localStorage.setItem('verdict-layout-test-height', panelContentPercent.toString());
            }

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
    }, [isResizingVertical, panelContentPercent]);

    // Double-click grip to toggle
    const handleGripDoubleClick = useCallback(() => {
        togglePanel();
    }, [togglePanel]);

    const isCollapsed = panelContentPercent === 0;

    return (
        <div
            ref={editorContainerRef}
            className={`flex-1 flex flex-col bg-[#1e1e1e] min-w-0 min-h-0 ${mobileView === 'problem' ? 'hidden md:flex' : 'flex'}`}
            style={{
                cursor: isResizingVertical ? 'row-resize' : 'auto',
            }}
        >
            {/* Editor Header */}
            <EditorToolbar
                language={language}
                setLanguage={setLanguage}
                code={code}
                setCode={setCode}
                submitting={submitting}
                onSubmit={onSubmit}
                onRunTests={onRunTests}
                isTestPanelVisible={!isCollapsed}
                setIsTestPanelVisible={(v) => { if (v) expandPanel(); else collapsePanel(); }}
                aiCode={aiCode}
                codeTab={codeTab}
                setCodeTab={setCodeTab}
                activeLeftPanelTab={activeLeftPanelTab}
            />

            {/* Code Editor - takes remaining space above the panel */}
            <div
                ref={wrapperRef}
                className="relative min-h-0 flex-1"
            >
                {/* Floating "Add to Chat" Button */}
                {showAskAIButton && selectedCode && onAskAboutCode && selectionPosition && selectionLineNumbers && (
                    <div
                        ref={askAIButtonRef}
                        onMouseEnter={() => setShowAskAIButton(true)}
                        onMouseLeave={() => {
                            setTimeout(() => {
                                if (editorInstanceRef.current) {
                                    const selection = editorInstanceRef.current.getSelection();
                                    if (!selection || selection.isEmpty()) {
                                        setShowAskAIButton(false);
                                    }
                                }
                            }, 300);
                        }}
                        className="absolute z-50 flex transform items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-800 p-1 shadow-xl transition-all duration-200 ease-out"
                        style={{
                            top: `${selectionPosition.top}px`,
                            left: `${selectionPosition.left}px`,
                            position: 'fixed',
                            transform: 'translate(-50%, -120%)'
                        }}
                    >
                        <button
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                            onClick={() => {
                                const lineRef = selectionLineNumbers.start === selectionLineNumbers.end
                                    ? `@ line ${selectionLineNumbers.start}`
                                    : `@ lines ${selectionLineNumbers.start}-${selectionLineNumbers.end}`;
                                onAskAboutCode(selectedCode, lineRef);
                                setShowAskAIButton(false);
                                setSelectionLineNumbers(null);
                                if (editorInstanceRef.current) {
                                    editorInstanceRef.current.setSelection({
                                        startLineNumber: 0,
                                        startColumn: 0,
                                        endLineNumber: 0,
                                        endColumn: 0
                                    });
                                }
                            }}
                        >
                            <MessageSquarePlus className="h-4 w-4" />
                            <span>Add to Chat</span>
                            <span className="ml-1 text-[10px] tracking-widest text-zinc-500 hidden sm:inline-block">{'\u2318'}L</span>
                        </button>
                        <div className="mx-1 h-4 w-[1px] bg-zinc-700" />
                        <button
                            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                            title="Copy Code"
                            onClick={async () => {
                                await navigator.clipboard.writeText(selectedCode);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                            }}
                        >
                            {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                )}

                <div className="absolute inset-0">
                    <Editor
                        height="100%"
                        defaultLanguage="cpp"
                        language={SUPPORTED_LANGUAGES.find(l => l.id === language)?.monaco || 'cpp'}
                        theme="vs-dark"
                        value={displayCode}
                        onChange={(value) => {
                            if (isReadOnlyRef.current || codeTabRef.current !== 'human') return;
                            const newValue = value || '';
                            if (aiCode && newValue === aiCode && newValue !== code) return;
                            if (newValue.includes('I am reading the problem and generating a solution')) return;
                            setCode(newValue);
                        }}
                        onMount={onEditorMount}
                        options={{
                            readOnly: isReadOnly,
                            minimap: { enabled: false },
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: false,
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
                            contextmenu: false,
                            scrollbar: {
                                vertical: 'visible',
                                horizontal: 'visible',
                                verticalScrollbarSize: 6,
                                horizontalScrollbarSize: 6,
                                useShadows: false,
                                verticalHasArrows: false,
                                horizontalHasArrows: false,
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

            {/* ============ TEST PANEL (ALWAYS RENDERED) ============ */}
            <div
                className="shrink-0 flex flex-col bg-[#1a1a1a]"
                style={{
                    height: isCollapsed
                        ? `${PANEL_TAB_BAR_HEIGHT}px`
                        : `calc(${panelContentPercent}% + ${PANEL_TAB_BAR_HEIGHT}px)`,
                    maxHeight: `${MAX_PANEL_PERCENT + 5}%`,
                    transition: isAnimating && !isResizingVertical ? 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                }}
            >
                {/* Grip Handle + Tab Bar (always visible) */}
                <div
                    className="shrink-0 select-none"
                    style={{ height: `${PANEL_TAB_BAR_HEIGHT}px` }}
                >
                    {/* Grip pill - draggable area */}
                    <div
                        className="flex items-center justify-center cursor-row-resize group touch-none"
                        style={{ height: '10px' }}
                        onMouseDown={handleGripMouseDown}
                        onTouchStart={handleGripMouseDown}
                        onDoubleClick={handleGripDoubleClick}
                    >
                        <div className="w-10 h-[3px] rounded-full bg-white/15 group-hover:bg-[#10B981]/60 group-active:bg-[#10B981] transition-colors" />
                    </div>

                    {/* Tab buttons */}
                    <div className="flex items-center px-1 bg-[#1a1a1a]" style={{ height: `${PANEL_TAB_BAR_HEIGHT - 10}px` }}>
                        <button
                            onClick={() => handleTabClick('testcase')}
                            className={`flex items-center gap-2 px-4 h-full text-[13px] font-medium transition-colors relative ${
                                testPanelTab === 'testcase'
                                    ? 'text-white'
                                    : 'text-[#808080] hover:text-[#b0b0b0]'
                            }`}
                        >
                            <CheckCircle2 size={14} />
                            Testcase
                            {testPanelTab === 'testcase' && (
                                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#10B981] rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabClick('result')}
                            className={`flex items-center gap-2 px-4 h-full text-[13px] font-medium transition-colors relative ${
                                testPanelTab === 'result'
                                    ? 'text-white'
                                    : 'text-[#808080] hover:text-[#b0b0b0]'
                            }`}
                        >
                            <Play size={14} />
                            Test Result
                            {testPanelTab === 'result' && (
                                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#10B981] rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => handleTabClick('codeforces')}
                            className={`flex items-center gap-2 px-4 h-full text-[13px] font-medium transition-colors relative ${
                                testPanelTab === 'codeforces'
                                    ? 'text-white'
                                    : 'text-[#808080] hover:text-[#b0b0b0]'
                            }`}
                        >
                            {cfStatus && cfStatus.status !== 'idle' ? (
                                cfStatus.status === 'done' ? (
                                    cfStatus.verdict === 'OK' || cfStatus.verdict === 'Accepted' ? (
                                        <CheckCircle2 size={14} className="text-green-400" />
                                    ) : (
                                        <XCircle size={14} className="text-red-400" />
                                    )
                                ) : (
                                    <Loader2 size={14} className="animate-spin text-blue-400" />
                                )
                            ) : (
                                <img
                                    src="https://codeforces.org/s/0/favicon-32x32.png"
                                    alt="CF"
                                    className="w-3.5 h-3.5"
                                />
                            )}
                            Codeforces
                            {testPanelTab === 'codeforces' && (
                                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#10B981] rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content area (height determined by parent, clips when collapsed) */}
                <div
                    className="flex-1 min-h-0 overflow-hidden border-t border-white/[0.06]"
                    style={{
                        opacity: isCollapsed ? 0 : 1,
                        transition: isAnimating ? 'opacity 0.2s ease' : 'none',
                    }}
                >
                    {!isCollapsed && (
                        <TestRunnerPanel
                            activeTab={testPanelTab}
                            setActiveTab={setTestPanelTab}
                            selectedTestCase={selectedTestCase}
                            setSelectedTestCase={setSelectedTestCase}
                            testCases={testCases}
                            result={result}
                            cfStatus={cfStatus}
                            contestId={contestId}
                            problemId={problemId}
                            onAddTestCase={onAddTestCase}
                            onDeleteTestCase={onDeleteTestCase}
                            onUpdateTestCase={onUpdateTestCase}
                            sampleTestCasesCount={sampleTestCasesCount}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
