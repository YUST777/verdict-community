'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LLMSettings {
    enabled: boolean;
    baseURL: string;
    apiKey: string;
    model: string;
    language: 'en' | 'ar';
}

const DEFAULT_SETTINGS: LLMSettings = {
    enabled: false,
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    language: 'en',
};

interface AIPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    codeforcesRating?: number;
    onPreferencesSaved?: () => void;
    selectedLevel?: number;
    onLevelChange?: (level: number) => void;
    variants?: { level: number; title: string; timeComplexity?: string }[];
}

export default function AIPreferencesModal({ isOpen, onClose, onPreferencesSaved, selectedLevel, onLevelChange, variants }: AIPreferencesModalProps) {
    const [settings, setSettings] = useState<LLMSettings>(DEFAULT_SETTINGS);
    const [solutionStyle, setSolutionStyle] = useState<'simple' | 'smart'>('simple');

    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('verdict_byok_llm');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    // Migrate old settings
                    if (parsed.systemPrompt && !parsed.language) {
                        parsed.language = 'en';
                        delete parsed.systemPrompt;
                    }
                    setSettings({ ...DEFAULT_SETTINGS, ...parsed });
                } catch (e) {
                    console.error('Failed to parse LLM settings');
                }
            }

            const storedStyle = localStorage.getItem('verdict_solution_style');
            if (storedStyle === 'smart' || storedStyle === 'simple') {
                setSolutionStyle(storedStyle);
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('verdict_byok_llm', JSON.stringify(settings));
        localStorage.setItem('verdict_solution_style', solutionStyle);
        window.dispatchEvent(new Event('llm_settings_changed'));
        onPreferencesSaved?.();
        onClose();
    };

    const fillProvider = (baseURL: string, model: string) => {
        setSettings(prev => ({ ...prev, baseURL, model }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="relative w-full sm:max-w-lg h-full bg-[#1a1a1a] border-l border-white/[0.06] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-white">{settings.language === 'ar' ? 'استخدم النموذج بتاعك' : 'Bring your own LLM'}</h2>
                                <p className="text-sm text-white/50 mt-1">{settings.language === 'ar' ? 'استخدم واجهة برمجية متوافقة مع المعيار المفتوح. كل الإعدادات والبيانات بتتحفظ عندك في المتصفح.' : 'Bring your own OpenAI-compatible API. All settings and credentials are saved locally in your browser.'}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                            <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabled}
                                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2cbb5d]"></div>
                                </label>
                                <span className="text-base font-semibold text-white">{settings.language === 'ar' ? 'تفعيل' : 'Enable'}</span>
                            </div>

                            {settings.enabled && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'رابط الواجهة البرمجية' : 'Base URL'}</label>
                                        <input
                                            type="text"
                                            value={settings.baseURL}
                                            onChange={e => setSettings({ ...settings, baseURL: e.target.value })}
                                            placeholder={settings.language === 'ar' ? 'رابط الواجهة البرمجية المتوافق مع المعيار المفتوح' : 'OpenAI compatible base URL'}
                                            className="w-full bg-transparent border border-white/[0.08] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#2cbb5d] transition-colors"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => fillProvider('https://api.openai.com/v1', 'gpt-4o')} className="text-xs border border-white/[0.08] bg-white/5 hover:bg-white/10 rounded px-2.5 py-1 text-white/70">OpenAI</button>
                                            <button onClick={() => fillProvider('https://generativelanguage.googleapis.com/v1beta/openai', 'gemini-2.5-flash')} className="text-xs border border-white/[0.08] bg-white/5 hover:bg-white/10 rounded px-2.5 py-1 text-white/70">Gemini</button>
                                            <button onClick={() => fillProvider('https://api.x.ai/v1', 'grok-beta')} className="text-xs border border-white/[0.08] bg-white/5 hover:bg-white/10 rounded px-2.5 py-1 text-white/70">xAI</button>
                                            <button onClick={() => fillProvider('https://openrouter.ai/api/v1', 'anthropic/claude-3-5-sonnet')} className="text-xs border border-white/[0.08] bg-white/5 hover:bg-white/10 rounded px-2.5 py-1 text-white/70">OpenRouter</button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'مفتاح الـ API' : 'API key'}</label>
                                        <input
                                            type="password"
                                            value={settings.apiKey}
                                            onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                                            placeholder={settings.language === 'ar' ? 'مفتاح الـ API الخاص بك' : 'sk-...'}
                                            className="w-full bg-transparent border border-white/[0.08] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#2cbb5d] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'الموديل' : 'Model'}</label>
                                        <input
                                            type="text"
                                            value={settings.model}
                                            onChange={e => setSettings({ ...settings, model: e.target.value })}
                                            placeholder={settings.language === 'ar' ? 'اسم الموديل (مثلاً gpt-4o)' : 'Model name (e.g., gpt-4o)'}
                                            className="w-full bg-transparent border border-white/[0.08] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#2cbb5d] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'اللغة' : 'Language'}</label>
                                        <p className="text-xs text-white/40 mt-0.5">{settings.language === 'ar' ? 'سيتحدث الذكاء الاصطناعي ويشرح الدروس والفيديوهات بهذه اللغة.' : 'The AI will explain, teach, and caption videos in this language.'}</p>
                                        <div className="flex bg-white/5 border border-white/[0.06] p-1 rounded-xl">
                                            <button
                                                onClick={() => setSettings({ ...settings, language: 'en' })}
                                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${settings.language === 'en' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                            >
                                                <span className="text-lg">🇺🇸</span>
                                                <span>English</span>
                                            </button>
                                            <button
                                                onClick={() => setSettings({ ...settings, language: 'ar' })}
                                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${settings.language === 'ar' ? 'bg-[#2cbb5d]/10 text-[#2cbb5d] border border-[#2cbb5d]/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                            >
                                                <span className="text-lg">🇸🇦</span>
                                                <span>العربية</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Solution difficulty level */}
                            {variants && variants.length > 0 && onLevelChange && (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'صعوبة الحل' : 'Solution Difficulty'}</label>
                                        <p className="text-xs text-white/40 mt-0.5">{settings.language === 'ar' ? 'مدى التفاصيل التي يكشفها الذكاء الاصطناعي عند شرح الحل.' : 'How much the AI reveals when explaining a solution.'}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {variants.map((v) => {
                                            const sel = selectedLevel === v.level;
                                            const palette = [
                                                { active: 'bg-orange-500/10 border-orange-500/30 text-orange-300', dot: 'bg-orange-400' },
                                                { active: 'bg-blue-500/10 border-blue-500/30 text-blue-300', dot: 'bg-blue-400' },
                                                { active: 'bg-[#2cbb5d]/10 border-[#2cbb5d]/30 text-[#2cbb5d]', dot: 'bg-[#2cbb5d]' },
                                            ];
                                            const p = palette[(v.level - 1) % 3];
                                            return (
                                                <button
                                                    key={v.level}
                                                    onClick={() => onLevelChange(v.level)}
                                                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all text-left ${sel
                                                        ? `${p.active}`
                                                        : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sel ? p.dot : 'bg-white/20'}`} />
                                                        <div>
                                                            <div className="text-[13px] font-semibold">{v.title}</div>
                                                            {v.timeComplexity && (
                                                                <div className="text-[10px] font-mono opacity-50 mt-0.5">{v.timeComplexity}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {sel && (
                                                        <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">{settings.language === 'ar' ? 'مفعل' : 'Active'}</div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Solution Style (Simple vs Smart) */}
                            <div className="space-y-3 pt-4 border-t border-white/[0.06] mt-4">
                                <div>
                                    <label className="text-sm font-semibold text-white">{settings.language === 'ar' ? 'أسلوب الحل' : 'Solution Style'}</label>
                                    <p className="text-xs text-white/40 mt-0.5">{settings.language === 'ar' ? 'كيفية كتابة الذكاء الاصطناعي للكود.' : 'How the AI approaches writing the code.'}</p>
                                </div>
                                <div className="flex bg-white/5 border border-white/[0.06] p-1 rounded-xl">
                                    <button
                                        onClick={() => setSolutionStyle('simple')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${solutionStyle === 'simple' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        <div className="text-[13px]">{settings.language === 'ar' ? 'منطق بسيط' : 'Simple Logic'}</div>
                                        <div className="text-[10px] opacity-60 font-normal">{settings.language === 'ar' ? 'سهل القراءة ومناسب للمبتدئين' : 'Readable & beginner-friendly'}</div>
                                    </button>
                                    <button
                                        onClick={() => setSolutionStyle('smart')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${solutionStyle === 'smart' ? 'bg-[#2cbb5d]/10 text-[#2cbb5d] border border-[#2cbb5d]/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                                    >
                                        <div className="text-[13px]">{settings.language === 'ar' ? 'ذكي / أمثل' : 'Smart / Optimal'}</div>
                                        <div className="text-[10px] opacity-60 font-normal">{settings.language === 'ar' ? 'أفضل تعقيد زمني ومكاني' : 'Best time/space complexity'}</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                {settings.language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-medium text-sm"
                            >
                                {settings.language === 'ar' ? 'حفظ' : 'Save'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
