'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, Bookmark, Copy, Check, Braces, Maximize2, Minimize2, User, Bot } from 'lucide-react';
import { SUPPORTED_LANGUAGES, TEMPLATES, getLanguageById } from './EditorConstants';
import { Tooltip } from '@/components/ui/Tooltip';

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
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

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
        if (TEMPLATES[langId]) setCode(TEMPLATES[langId]);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleFullScreen = () => {
        setIsFullScreen(true);
        document.documentElement.requestFullscreen?.();
    };

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
        document.exitFullscreen?.();
    };

    // Listen for fullscreen changes from keyboard (Esc, etc.)
    useEffect(() => {
        const handler = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    return (
        <div className="flex flex-col bg-[#1a1a1a] border-b border-white/10 shrink-0 select-none header relative z-[50] overflow-visible">
            <div className="w-full h-10 px-3 flex items-center justify-between text-neutral-400 bg-[#1a1a1a] overflow-visible">
                <div className="flex items-center gap-3">
                    {/* AI Code Tab Switcher (only when AI Tutor tab is active) */}
                    {activeLeftPanelTab === 'solution' && (
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
                            <button
                                onClick={() => setCodeTab('human')}
                                className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1.5 ${codeTab === 'human' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/80'}`}
                            >
                                <User size={12} />
                                <span className="hidden sm:inline">Human</span>
                            </button>
                            <button
                                onClick={() => setCodeTab('ai')}
                                className={`px-2.5 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1.5 ${codeTab === 'ai' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white/80'}`}
                            >
                                <Bot size={12} className="text-[#10B981]" />
                                <span className="hidden sm:inline">AI</span>
                            </button>
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-2 outline-none transition-all duration-300 hover:bg-white/5 px-2 py-1 rounded-md cursor-pointer text-[13px] text-white/60 hover:text-white"
                        >
                            {getLanguageById(language)?.name || 'C++'}
                            <ChevronUp className="w-4 rotate-180 opacity-50" />
                        </button>
                        {isLangOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 w-44 bg-[#282828] border border-white/10 rounded shadow-2xl z-50 py-1.5 max-h-80 overflow-y-auto">
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <button
                                            key={lang.id}
                                            onClick={() => handleLanguageChange(lang.id)}
                                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 hover:text-white transition-colors ${language === lang.id ? 'text-[#10B981] bg-white/5' : 'text-[#A0A0A0]'}`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Tooltip content="Bookmark" position="bottom">
                        <Bookmark className="w-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
                    </Tooltip>

                    <Tooltip content={isCopied ? 'Copied!' : 'Copy Code'} position="bottom">
                        {isCopied ?
                            <Check className="w-4 text-green-500 transition-colors" /> :
                            <Copy onClick={handleCopyToClipboard} className="w-4 cursor-pointer text-white/40 hover:text-white transition-colors" />
                        }
                    </Tooltip>

                    <Tooltip content="Format Code" position="bottom">
                        <Braces className="w-4 cursor-pointer text-[#10B981]/60 hover:text-[#10B981] transition-colors" />
                    </Tooltip>

                    <Tooltip content={isFullScreen ? 'Exit Full Screen' : 'Full screen'} position="bottom">
                        {isFullScreen ?
                            <Minimize2 onClick={handleExitFullScreen} className="w-4 ml-2 cursor-pointer text-white/40 hover:text-white transition-colors" /> :
                            <Maximize2 onClick={handleFullScreen} className="w-4 ml-2 cursor-pointer text-white/40 hover:text-white transition-colors" />
                        }
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
