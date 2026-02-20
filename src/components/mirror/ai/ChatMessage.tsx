'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Youtube } from 'lucide-react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { Message, MessageContent } from '@/components/ui/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtHeader,
    ChainOfThoughtStep,
} from '@/components/ui/chain-of-thought';

interface ChatMessageData {
    id: string;
    role: 'user' | 'assistant' | 'sources';
    content: string;
    timestamp: Date;
    codeBlock?: {
        code: string;
        language: string;
        lineReference?: string;
    };
    sources?: any[];
}

interface ChatMessageProps {
    message: ChatMessageData;
    isAuthenticated: boolean;
    userEmail?: string;
}

export default function ChatMessage({ message, isAuthenticated, userEmail }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

    let thinkContent = null;
    let mainContent = message.content || '';

    if (!isUser && message.role !== 'sources') {
        const thinkMatch = mainContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            thinkContent = thinkMatch[1].trim();
            mainContent = mainContent.replace(thinkMatch[0], '').trim();
        } else if (mainContent.includes('<think>')) {
            thinkContent = mainContent.replace('<think>', '').trim();
            mainContent = '';
        }
    }

    const isThoughtExpanded = userExpanded !== null ? userExpanded : (!!thinkContent && !mainContent);

    // Split think content into rough steps by double newlines for the ChainOfThought visual
    const thinkSteps = thinkContent ? thinkContent.split(/\n\n+/).filter(step => step.trim().length > 0) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex"
        >
            <Message from={message.role === 'sources' ? 'assistant' : message.role} className="py-2 w-full">
                <MessageContent className={cn(
                    "text-left",
                    isUser ? "max-w-[85%] bg-emerald-600/90 text-white rounded-2xl rounded-tr-sm shadow-md border-0" : "w-full max-w-[95%] bg-[#1E1E24]/90 text-white/90 border border-white/5 rounded-2xl shadow-md"
                )}>
                    {message.codeBlock && (
                        <div className="mb-3 mt-1 rounded-lg bg-black/60 border border-white/10 overflow-hidden text-left shadow-inner">
                            <div className="px-3 py-2 bg-[#121212]/80 border-b border-white/5 flex items-center justify-between backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">{message.codeBlock.language}</span>
                                    {message.codeBlock.lineReference && (
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0 bg-blue-500/15 border border-blue-500/20 text-blue-300 text-[10px] font-mono">
                                            <span>@</span>
                                            <span>{message.codeBlock.lineReference.replace('@ ', '').replace('@', '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <pre className="px-3 py-2.5 text-xs font-mono text-white/80 overflow-x-auto text-left leading-relaxed">
                                <code>{message.codeBlock.code}</code>
                            </pre>
                        </div>
                    )}

                    <div className="text-[13px] sm:text-sm leading-relaxed break-words markdown-body" style={{ unicodeBidi: 'plaintext' }}>
                        {thinkSteps.length > 0 && (
                            <ChainOfThought>
                                <ChainOfThoughtHeader title="Analyzed reasoning process" />
                                <ChainOfThoughtContent>
                                    {thinkSteps.map((stepContent, idx) => (
                                        <ChainOfThoughtStep key={idx} status={mainContent ? "completed" : (idx === thinkSteps.length - 1 ? "in-progress" : "completed")}>
                                            <MarkdownRenderer content={stepContent} />
                                        </ChainOfThoughtStep>
                                    ))}
                                </ChainOfThoughtContent>
                            </ChainOfThought>
                        )}
                        {mainContent && <MarkdownRenderer content={mainContent} />}
                        {message.role === 'sources' && message.sources && message.sources.length > 0 && (
                            <div className="mt-2 space-y-3">
                                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Sources Found</div>
                                <div className="flex flex-wrap gap-3">
                                    {message.sources.map((src, i) => (
                                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                            className="flex gap-3 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20 transition-all rounded-xl p-3 max-w-[400px] group">
                                            {src.type === 'youtube' && src.thumbnail ? (
                                                <div className="relative w-24 h-16 shrink-0 rounded-md overflow-hidden bg-zinc-900 border border-white/10">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={src.thumbnail} alt={src.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] text-white">
                                                        {src.duration}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 shrink-0 rounded-md bg-zinc-800 flex items-center justify-center border border-white/10">
                                                    <Globe size={18} className="text-zinc-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="text-sm font-medium text-white/90 truncate flex items-center gap-1.5">
                                                    {src.type === 'youtube' ? <Youtube size={14} className="text-red-500 shrink-0" /> : null}
                                                    <span className="truncate">{src.title}</span>
                                                </div>
                                                {src.type === 'youtube' ? (
                                                    <div className="text-[10px] text-white/40 mt-1 truncate">
                                                        {src.author} • {src.views} views
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-snug">
                                                        {src.description}
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </MessageContent>

                {isUser && (
                    <Avatar className="size-8 mt-auto hidden sm:block">
                        <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                            {isAuthenticated && userEmail ? userEmail.charAt(0).toUpperCase() : <User size={13} strokeWidth={2.5} />}
                        </AvatarFallback>
                    </Avatar>
                )}
            </Message>
        </motion.div>
    );
}
