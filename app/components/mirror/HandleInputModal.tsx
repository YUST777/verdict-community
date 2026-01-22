'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface HandleInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (handle: string) => void;
}

export default function HandleInputModal({ isOpen, onClose, onSave }: HandleInputModalProps) {
    const [handle, setHandle] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

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
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Enter Codeforces Handle</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                    Enter your Codeforces handle to view your submissions. This will be saved locally in your browser.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={handle}
                            onChange={(e) => {
                                setHandle(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., tourist, Petr"
                            className="w-full px-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-colors"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400">{error}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

