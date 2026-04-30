'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Youtube } from 'lucide-react';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import InlineVideoExplainer from '../video/InlineVideoExplainer';
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
    videoScript?: any;
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
                    isUser ? "max-w-[85%] bg-[#2cbb5d] text-white rounded-xl rounded-tr-sm border-0" : "w-full max-w-[95%] bg-[#1a1a1a] text-white/90 border border-white/[0.06] rounded-xl"
                )}>
                    {message.codeBlock && (
                        <div className="mb-3 mt-1 rounded-lg bg-[#0d0d0d] border border-white/[0.06] overflow-hidden text-left">
                            <div className="px-3 py-2 bg-[#161616] border-b border-white/[0.06] flex items-center justify-between ">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">{message.codeBlock.language}</span>
                                    {message.codeBlock.lineReference && (
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded flex-shrink-0 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono">
                                            <span>@</span>
                                            <span>{message.codeBlock.lineReference.replace('@ ', '').replace('@', '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <pre className="px-3 py-2.5 text-xs font-mono text-white/80 overflow-x-auto text-left leading-relaxed">
                                <code
                                    dangerouslySetInnerHTML={{
                                        __html: (function highlight(code: string) {
                                            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                            return escaped
                                                .replace(/\b(int|long|double|float|char|string|void|bool|if|else|for|while|return|main|using|namespace|include|std|vector|map|set|pair)\b/g, '<span class="text-blue-400 font-bold">$1</span>')
                                                .replace(/([-+*\/%&|^!=]+|&lt;|&gt;)/g, '<span class="text-white/40">$1</span>')
                                                .replace(/(&#47;&#47;.*)/g, '<span class="text-zinc-500 italic">$1</span>');
                                        })(message.codeBlock.code)
                                    }}
                                />
                            </pre>
                        </div>
                    )}

                    <div className="text-[13px] sm:text-sm leading-relaxed break-words markdown-body" style={{ unicodeBidi: 'plaintext' }}>
                        {thinkSteps.length > 0 && (
                            <ChainOfThought>
                                <ChainOfThoughtHeader title={(() => {
                                    const first = thinkSteps[0] || '';
                                    const isAr = /[\u0600-\u06FF]/.test(first);
                                    if (first.includes('cooking') || first.includes('بجهز')) return isAr ? 'وقت التعليم' : 'Tutoring Session';
                                    return isAr ? 'منطق النظام' : 'Analyzed reasoning process';
                                })()} />
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
                        {message.videoScript && <InlineVideoExplainer script={message.videoScript as any} />}
                        {message.role === 'sources' && message.sources && message.sources.length > 0 && (
                            <div className="mt-2 space-y-3">
                                <div className="text-xs font-semibold text-[#2cbb5d] uppercase tracking-wider mb-2">{/[\u0600-\u06FF]/.test(message.content || '') ? 'المصادر اللي اتلقت' : 'Sources Found'}</div>
                                <div className="flex flex-wrap gap-3">
                                    {message.sources.map((src, i) => (
                                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                            className="flex gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.10] transition-all rounded-lg p-3 max-w-[400px] group">
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
                        <AvatarFallback className="bg-[#1a1a1a] text-[#999] font-bold border border-white/[0.06]">
                            {isAuthenticated && userEmail ? userEmail.charAt(0).toUpperCase() : <User size={13} strokeWidth={2.5} />}
                        </AvatarFallback>
                    </Avatar>
                )}
            </Message>
        </motion.div>
    );
}
