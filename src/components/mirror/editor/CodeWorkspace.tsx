import { Wand2 } from 'lucide-react';
import { Editor, OnMount } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { SubmissionResult, Example, CFSubmissionStatus } from '../shared/types';
import TestRunnerPanel from '../test/TestRunnerPanel';
import EditorToolbar from './EditorToolbar';
import AskAIButton from './AskAIButton';
import { useVerticalResize } from './useVerticalResize';
import { SUPPORTED_LANGUAGES, TEMPLATES, getLanguageById } from './EditorConstants';

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
    // AI code
    aiCode?: string;
    activeTab?: 'human' | 'ai';
    setActiveTab?: (tab: 'human' | 'ai') => void;
    // AI actions
    onAskAboutCode?: (selectedCode: string, question?: string) => void;
    onExplainLine?: (lineNumber: number, code: string) => void;
    onExplainFunction?: (functionCode: string) => void;
    onOptimizeCode?: (code: string) => void;
    onFindBugs?: (code: string) => void;
    // Visibilty Control
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
    const [internalTab, setInternalTab] = useState<'testcase' | 'result' | 'codeforces'>('testcase');
    const [selectedTestCase, setSelectedTestCase] = useState(0);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [internalCodeTab, setInternalCodeTab] = useState<'human' | 'ai'>('human');
    const [selectedCode, setSelectedCode] = useState<string>('');
    const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null);
    const [showAskAIButton, setShowAskAIButton] = useState(false);
    const [selectionLineNumbers, setSelectionLineNumbers] = useState<{ start: number; end: number } | null>(null);
    const askAIButtonRef = useRef<HTMLButtonElement>(null);

    // Use external tab control if provided, otherwise internal
    const codeTab = externalActiveTab ?? internalCodeTab;
    const setCodeTab = setExternalActiveTab ?? setInternalCodeTab;

    // Determine which code to show
    const displayCode = codeTab === 'ai' ? aiCode : code;
    const isReadOnly = codeTab === 'ai';

    // Sync Ref Pattern: Update refs during render to avoid useEffect delays (Race Condition Fix)
    const codeTabRef = useRef(codeTab);
    const isReadOnlyRef = useRef(isReadOnly);
    codeTabRef.current = codeTab;
    isReadOnlyRef.current = isReadOnly;

    useEffect(() => {
        // Redundant but kept for safety/other effects if needed
        codeTabRef.current = codeTab;
    }, [codeTab]);

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
    const onEditorMount: OnMount = (editor, monacoEditor) => {
        editorInstanceRef.current = editor;
        handleEditorDidMount(editor, monacoEditor);

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

        // Handle code selection for "Ask AI" button
        editor.onDidChangeCursorSelection(() => {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                const selection = editor.getSelection();
                if (selection && !selection.isEmpty()) {
                    const selectedText = editor.getModel()?.getValueInRange(selection) || '';
                    if (selectedText.trim().length > 0 && selectedText.trim().length < 10000) {
                        setSelectedCode(selectedText);

                        // Store line numbers for display
                        const startLine = selection.startLineNumber;
                        const endLine = selection.endLineNumber;
                        setSelectionLineNumbers({ start: startLine, end: endLine });

                        // Calculate position for floating button using Monaco's coordinate system
                        const editorDom = editor.getDomNode();
                        if (editorDom) {
                            const rect = editorDom.getBoundingClientRect();

                            // Get the end position of selection
                            const endPosition = selection.getEndPosition();

                            // Use Monaco's coordinate conversion
                            const coords = editor.getScrolledVisiblePosition(endPosition);

                            if (coords) {
                                // Monaco returns coordinates relative to the editor's content area
                                // Use default values for line height and font size (Monaco defaults)
                                const lineHeight = 22; // Default Monaco line height
                                const fontSize = 13; // Default Monaco font size
                                const charWidth = fontSize * 0.6; // Approximate character width

                                // Get the content area (excluding line numbers)
                                const contentLeft = editor.getLayoutInfo().contentLeft;

                                // Calculate absolute position relative to viewport
                                const top = rect.top + coords.top + lineHeight + 5; // Position below the line
                                const left = rect.left + contentLeft + coords.left + (charWidth * 2); // Position to the right of selection

                                // Ensure button stays within editor bounds
                                const buttonWidth = 200; // Approximate button width with line numbers
                                const maxLeft = rect.right - buttonWidth - 10;
                                const finalLeft = Math.max(rect.left + 10, Math.min(left, maxLeft));

                                // Ensure button stays within vertical bounds
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

        // Hide button when clicking outside
        editor.onMouseDown(() => {
            setTimeout(() => {
                const selection = editor.getSelection();
                if (!selection || selection.isEmpty()) {
                    setShowAskAIButton(false);
                }
            }, 100);
        });

        // Note: Custom context menu will be implemented via React overlay
        // Monaco's native context menu is disabled via contextmenu: false in options
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
            <EditorToolbar
                language={language}
                setLanguage={setLanguage}
                code={code}
                setCode={setCode}
                submitting={submitting}
                onSubmit={onSubmit}
                onRunTests={onRunTests}
                isTestPanelVisible={isTestPanelVisible}
                setIsTestPanelVisible={setIsTestPanelVisible}
                aiCode={aiCode}
                codeTab={codeTab}
                setCodeTab={setCodeTab}
                activeLeftPanelTab={activeLeftPanelTab}
            />

            {/* Code Editor */}
            <div
                ref={wrapperRef}
                className="relative min-h-0"
                style={{
                    flex: isTestPanelVisible ? `1 1 calc(100% - var(--test-panel-h))` : '1 1 100%'
                }}
            >
                {/* Floating "Ask AI" Button - Cursor IDE style */}
                {showAskAIButton && activeLeftPanelTab === 'solution' && selectedCode && onAskAboutCode && selectionPosition && selectionLineNumbers && !isReadOnly && (
                    <button
                        ref={askAIButtonRef}
                        onClick={() => {
                            const lineRef = selectionLineNumbers.start === selectionLineNumbers.end
                                ? `@ line ${selectionLineNumbers.start}`
                                : `@ lines ${selectionLineNumbers.start}-${selectionLineNumbers.end}`;
                            onAskAboutCode(selectedCode, lineRef);
                            setShowAskAIButton(false);
                            setSelectionLineNumbers(null);
                            // Clear selection after clicking
                            if (editorInstanceRef.current) {
                                editorInstanceRef.current.setSelection({
                                    startLineNumber: 0,
                                    startColumn: 0,
                                    endLineNumber: 0,
                                    endColumn: 0
                                });
                            }
                        }}
                        className="absolute z-50 flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#252526] border border-emerald-500/40 hover:border-emerald-500/60 text-white text-xs font-medium rounded-md transition-all duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                        style={{
                            top: `${selectionPosition.top}px`,
                            left: `${selectionPosition.left}px`,
                            position: 'fixed'
                        }}
                        onMouseEnter={() => setShowAskAIButton(true)}
                        onMouseLeave={() => {
                            // Keep button visible if code is still selected
                            setTimeout(() => {
                                if (editorInstanceRef.current) {
                                    const selection = editorInstanceRef.current.getSelection();
                                    if (!selection || selection.isEmpty()) {
                                        setShowAskAIButton(false);
                                    }
                                }
                            }, 300);
                        }}
                    >
                        <Wand2 size={12} className="text-emerald-400" strokeWidth={2} />
                        <span className="text-white font-medium">Ask AI</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-mono leading-tight">
                            <span>@</span>
                            <span>
                                {selectionLineNumbers.start === selectionLineNumbers.end
                                    ? `line ${selectionLineNumbers.start}`
                                    : `lines ${selectionLineNumbers.start}-${selectionLineNumbers.end}`}
                            </span>
                        </span>
                    </button>
                )}

                <div className="absolute inset-0">
                    <Editor
                        height="100%"
                        defaultLanguage="cpp"
                        language={SUPPORTED_LANGUAGES.find(l => l.id === language)?.monaco || 'cpp'}
                        theme="vs-dark"
                        value={displayCode}
                        onChange={(value) => {
                            // CRITICAL GUARDS:
                            // 1. Must be in 'human' mode and not read-only.
                            // Use Ref to avoid stale closures in Monaco callbacks
                            // CRITICAL GUARDS:
                            // 1. Must be in 'human' mode and not read-only.
                            // Use Ref to avoid stale closures in Monaco callbacks
                            if (isReadOnlyRef.current || codeTabRef.current !== 'human') return;

                            const newValue = value || '';

                            // 2. Race Condition Guard:
                            // If the new value matches the AI code (and it's different from current user code),
                            // it means the editor buffer hasn't cleared the AI content yet after a tab switch.
                            // We MUST ignore this event.
                            if (aiCode && newValue === aiCode && newValue !== code) {
                                return;
                            }

                            // 3. Placeholder Guard:
                            // Explicitly block the AI placeholder text from ever being saved as user code.
                            if (newValue.includes('I am reading the problem and generating a solution')) {
                                return;
                            }

                            setCode(newValue);
                        }}
                        onMount={onEditorMount}
                        options={{
                            readOnly: isReadOnly,
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
                            contextmenu: false, // Disable default context menu, we'll use custom
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
