
import { Brain, Clock, Database, Zap, X } from 'lucide-react';
import { ComplexityResult } from '../shared/types';

interface ComplexityModalProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    result: ComplexityResult | null;
}

export default function ComplexityModal({ isOpen, onClose, loading, result }: ComplexityModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#34D399]/10 flex items-center justify-center border border-[#10B981]/20">
                            <Brain size={20} className="text-[#10B981]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Complexity Analysis</h3>
                            <p className="text-xs text-[#666]">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X size={16} className="text-[#888]" />
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-[#10B981]/20 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#10B981] rounded-full animate-spin" />
                        </div>
                        <p className="mt-4 text-[#888] text-sm">Analyzing your code...</p>
                    </div>
                ) : result ? (
                    <div className="space-y-6">
                        {/* Complexity Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Time Complexity */}
                            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-emerald-400" />
                                        <span className="text-xs font-medium text-emerald-400/80">Time</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white font-serif italic">
                                        {result.timeComplexity}
                                    </p>
                                </div>
                            </div>

                            {/* Space Complexity */}
                            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Database size={14} className="text-blue-400" />
                                        <span className="text-xs font-medium text-blue-400/80">Space</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white font-serif italic">
                                        {result.spaceComplexity}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-yellow-400" />
                                <span className="text-xs font-medium text-[#888]">Explanation</span>
                            </div>
                            <p className="text-sm text-[#ccc] leading-relaxed">
                                {result.explanation}
                            </p>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#10B981]/20"
                        >
                            Got it!
                        </button>
                    </div>
                ) : null}
            </div>
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
}
