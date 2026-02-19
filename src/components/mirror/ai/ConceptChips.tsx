import { Play, FileText, BookOpen } from 'lucide-react';

interface Concept {
    title: string;
    url: string;
    type: 'video' | 'article';
}

interface ConceptChipsProps {
    concepts: Concept[];
}

export default function ConceptChips({ concepts }: ConceptChipsProps) {
    if (concepts.length === 0) return null;

    return (
        <div className="px-3 py-2 border-t border-white/5 bg-[#0d0d0d]">
            <div className="flex items-center gap-2 mb-1.5">
                <BookOpen size={10} className="text-purple-400" strokeWidth={2} />
                <span className="text-[9px] font-semibold text-purple-400 uppercase tracking-wide">Learn More</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {concepts.map((concept, idx) => (
                    <a
                        key={idx}
                        href={concept.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-md text-[10px] text-white/60 hover:text-white/90 transition-all"
                        title={concept.title}
                    >
                        {concept.type === 'video' ? (
                            <Play size={9} className="text-blue-400 group-hover:text-blue-300" strokeWidth={2.5} />
                        ) : (
                            <FileText size={9} className="text-emerald-400 group-hover:text-emerald-300" strokeWidth={2.5} />
                        )}
                        <span className="truncate max-w-[120px] font-medium">{concept.title}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
