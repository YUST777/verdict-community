'use client';

import { User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import MarkdownRenderer from '../shared/MarkdownRenderer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    codeBlock?: {
        code: string;
        language: string;
        lineReference?: string;
    };
}

interface ChatMessageProps {
    message: Message;
    isAuthenticated: boolean;
    userEmail?: string;
}

export default function ChatMessage({ message, isAuthenticated, userEmail }: ChatMessageProps) {
    const [msgCopied, setMsgCopied] = useState(false);
    return (
        <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                    <Image
                        src="/icons/logo.webp"
                        alt="AI"
                        fill
                        className="object-contain p-1.5"
                    />
                </div>
            )}
            <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${message.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                    : 'bg-[#1a1a1a] text-white/95 border border-white/[0.08]'
                    }`}
            >
                {message.codeBlock && (
                    <div className="mb-3 mt-1 rounded-lg bg-black/40 border border-white/10 overflow-hidden">
                        <div className="px-3 py-2 bg-black/50 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">{message.codeBlock.language}</span>
                                {message.codeBlock.lineReference && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-mono">
                                        <span>@</span>
                                        <span>{message.codeBlock.lineReference.replace('@ ', '').replace('@', '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <pre className="px-3 py-2.5 text-xs font-mono text-white/90 overflow-x-auto">
                            <code>{message.codeBlock.code}</code>
                        </pre>
                    </div>
                )}
                <div className="text-sm leading-relaxed text-white/95 break-words" style={{ unicodeBidi: 'plaintext' }}>
                    <MarkdownRenderer content={message.content} />
                </div>
                <p className="text-[10px] text-white/40 font-medium mt-2.5">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    {isAuthenticated && userEmail ? (
                        <span className="text-[11px] font-bold text-emerald-400">
                            {userEmail.charAt(0).toUpperCase()}
                        </span>
                    ) : (
                        <User size={13} className="text-emerald-400" strokeWidth={2.5} />
                    )}
                </div>
            )}
        </div>
    );
}
