'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
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
        <Message from={message.role === 'sources' ? 'assistant' : message.role} className="py-2">
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
    );
}
