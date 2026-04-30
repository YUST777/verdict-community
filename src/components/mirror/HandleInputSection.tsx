'use client';

import { useState } from 'react';
import { Save, User } from 'lucide-react';

interface HandleInputSectionProps {
    onSave: (handle: string) => void;
    compact?: boolean;
}

export default function HandleInputSection({ onSave, compact = false }: HandleInputSectionProps) {
    const [handle, setHandle] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = handle.trim();
        
        if (!trimmed) {
            setError('Handle cannot be empty');
            return;
        }

        if (trimmed.length < 3 || trimmed.length > 24) {
            setError('Handle must be between 3 and 24 characters');
            return;
        }

        // Basic validation: alphanumeric, underscore, hyphen
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            setError('Handle can only contain letters, numbers, underscores, and hyphens');
            return;
        }

        onSave(trimmed);
        setHandle('');
        setError('');
    };

    if (compact) {
        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto border border-[#10B981]/20">
                        <User size={24} className="text-[#10B981]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Enter Codeforces Handle</h3>
                    <p className="text-xs text-white/60">
                        Enter your handle to view your submissions
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => {
                                setHandle(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., tourist, Petr"
                            className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#10B981] transition-colors text-sm"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-1.5 text-xs text-red-400">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] active:bg-[#059669] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm touch-manipulation"
                    >
                        <Save size={16} />
                        Save Handle
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#0B0B0C]">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto border border-[#10B981]/20">
                        <User size={32} className="text-[#10B981]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Enter Codeforces Handle</h2>
                    <p className="text-sm text-white/60">
                        Enter your Codeforces handle to view your submissions. This will be saved locally in your browser.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => {
                                setHandle(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., tourist, Petr"
                            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#10B981] transition-colors text-sm sm:text-base"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-[#10B981] hover:bg-[#059669] active:bg-[#059669] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20 touch-manipulation"
                    >
                        <Save size={18} />
                        Save Handle
                    </button>
                </form>
            </div>
        </div>
    );
}

