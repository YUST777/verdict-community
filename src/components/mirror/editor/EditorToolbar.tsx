'use client';

import { useState } from 'react';
import { Loader2, Play, ChevronDown, User, Bot } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TEMPLATES, getLanguageById } from './EditorConstants';

interface EditorToolbarProps {
    language: string;
    setLanguage: (lang: string) => void;
    code: string;
    setCode: (code: string) => void;
    submitting: boolean;
    onSubmit: () => void;
    onRunTests?: () => void;
    isTestPanelVisible: boolean;
    setIsTestPanelVisible: (visible: boolean) => void;
    // AI code tab
    aiCode?: string;
    codeTab: 'human' | 'ai';
    setCodeTab: (tab: 'human' | 'ai') => void;
    activeLeftPanelTab?: string;
}

export default function EditorToolbar({
    language,
    setLanguage,
    code,
    setCode,
    submitting,
    onSubmit,
    onRunTests,
    isTestPanelVisible,
    setIsTestPanelVisible,
    aiCode,
    codeTab,
    setCodeTab,
    activeLeftPanelTab
}: EditorToolbarProps) {
    const [isLangOpen, setIsLangOpen] = useState(false);

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

    return (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Code Tab Switcher (Show ONLY if AI Tutor tab is active) */}
                {activeLeftPanelTab === 'solution' && (
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
                        <button
                            onClick={() => setCodeTab('human')}
                            className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1.5 ${codeTab === 'human'
                                ? 'bg-white/10 text-white'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            <User size={12} className="sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Human</span>
                        </button>
                        <button
                            onClick={() => setCodeTab('ai')}
                            className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1.5 ${codeTab === 'ai'
                                ? 'bg-white/10 text-white'
                                : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            <Bot size={12} className="sm:w-3 sm:h-3 text-[#10B981]" />
                            <span className="hidden sm:inline">AI</span>
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-1.5 sm:gap-2 relative">
                    <span className="text-xs sm:text-sm font-medium text-white hidden xs:inline">Code</span>
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-2 sm:px-2 py-1.5 sm:py-0.5 bg-white/10 rounded text-[#A0A0A0] active:text-white transition-colors border border-transparent active:border-white/10 touch-manipulation min-h-[32px]"
                        >
                            <span className="max-w-[60px] sm:max-w-none truncate">{getLanguageById(language)?.name || 'C++'}</span>
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
                    disabled={submitting || !code.trim() || codeTab === 'ai'}
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
    );
}
