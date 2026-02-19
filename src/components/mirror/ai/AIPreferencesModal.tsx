'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Wand2, MessageSquare, Zap, BookOpen, Brain } from 'lucide-react';
// @ts-ignore - module may not exist in this branch
import { AILearningPreferences, loadAIPreferences, saveAIPreferences, DEFAULT_PREFERENCES } from '@/lib/ai-personalization';

interface AIPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    codeforcesRating?: number;
    onPreferencesSaved?: () => void;
}

export default function AIPreferencesModal({ isOpen, onClose, codeforcesRating, onPreferencesSaved }: AIPreferencesModalProps) {
    const [preferences, setPreferences] = useState<Partial<AILearningPreferences>>(DEFAULT_PREFERENCES);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const loaded = loadAIPreferences();
            const current = { ...DEFAULT_PREFERENCES, ...loaded };
            setPreferences(current);
            setHasChanges(false);
        }
    }, [isOpen]);

    const handleSave = async () => {
        // Save to LocalStorage (fast fallback)
        saveAIPreferences(preferences);

        // Save to Server (Supabase)
        try {
            await fetch('/api/ai/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });
        } catch (e) {
            console.error('[AI Preferences] Failed to sync with server:', e);
        }

        setHasChanges(false);
        onPreferencesSaved?.(); // Notify parent to reload preferences
        onClose();
    };

    const handleChange = <K extends keyof AILearningPreferences>(
        key: K,
        value: AILearningPreferences[K]
    ) => {
        setPreferences((prev: any) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f0f10] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Settings size={18} className="text-emerald-400" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">AI Preferences</h2>
                            <p className="text-xs text-white/50">Customize how the AI responds to you</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">


                    {/* Auto-Detect Intent */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain size={16} className="text-emerald-400" strokeWidth={2.5} />
                                <h3 className="text-sm font-semibold text-white">Auto-Detect Intent</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.preferredExplanationFormat === 'mixed'}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            handleChange('preferredExplanationFormat', 'mixed');
                                        }
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                        <p className="text-xs text-white/50">
                            Automatically adjust response length based on your question (recommended)
                        </p>
                    </div>

                    {/* Tone Preference */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap size={16} className="text-emerald-400" strokeWidth={2.5} />
                            <h3 className="text-sm font-semibold text-white">Communication Tone</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(['friendly', 'professional', 'casual', 'technical'] as const).map((tone) => (
                                <button
                                    key={tone}
                                    onClick={() => handleChange('preferredTone', tone)}
                                    className={`px-4 py-2.5 rounded-lg border transition-all text-left ${preferences.preferredTone === tone
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                                        }`}
                                >
                                    <div className="text-xs font-medium capitalize">{tone}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Learning Style */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-emerald-400" strokeWidth={2.5} />
                            <h3 className="text-sm font-semibold text-white">Learning Style</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(['visual', 'detailed', 'concise', 'interactive'] as const).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => handleChange('learningStyle', style)}
                                    className={`px-4 py-2.5 rounded-lg border transition-all text-left ${preferences.learningStyle === style
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                                        }`}
                                >
                                    <div className="text-xs font-medium capitalize">{style}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expert Mode */}
                    {codeforcesRating && codeforcesRating >= 1600 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Wand2 size={16} className="text-emerald-400" strokeWidth={2.5} />
                                    <h3 className="text-sm font-semibold text-white">Expert Mode</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences.useExpertMode || false}
                                        onChange={(e) => handleChange('useExpertMode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <p className="text-xs text-white/50">
                                World Finals level analysis with sensitivity audits (for advanced users)
                            </p>
                        </div>
                    )}

                    {/* Content Preferences */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white">Include in Responses</h3>
                        <div className="space-y-2">
                            {[
                                { key: 'includeComplexityAnalysis' as const, label: 'Complexity Analysis' },
                                { key: 'includeOptimizationTips' as const, label: 'Optimization Tips' },
                                { key: 'includeCommonMistakes' as const, label: 'Common Mistakes' },
                                { key: 'useExamples' as const, label: 'Code Examples' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={preferences[key] ?? true}
                                        onChange={(e) => handleChange(key, e.target.checked)}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-emerald-500/50 focus:ring-2"
                                    />
                                    <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-[#0f0f10] shrink-0 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg transition-colors font-medium"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
