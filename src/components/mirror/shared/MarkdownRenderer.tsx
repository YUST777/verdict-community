'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Copy, Check } from 'lucide-react'; // Added icons
import { useState } from 'react'; // Added useState

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Detect if text contains Arabic characters
function containsArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
}

// Detect text direction (RTL for Arabic, LTR for English)
function getTextDirection(text: string): 'rtl' | 'ltr' {
    return containsArabic(text) ? 'rtl' : 'ltr';
}

// Recursively extract text from React children to detect language
function getTextContent(children: React.ReactNode): string {
    if (typeof children === 'string') return children;
    if (typeof children === 'number') return String(children);
    if (Array.isArray(children)) {
        return children.map(getTextContent).join('');
    }
    if (React.isValidElement(children)) {
        return getTextContent((children.props as any).children);
    }
    return '';
}



// Code Block with Copy Button
const CodeBlock = ({ className, children, ...props }: any) => {
    const [isCopied, setIsCopied] = useState(false);
    const text = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const match = /language-(\w+)/.exec(className || '');
    // If it has a language class OR contains newlines, treat as block
    const isBlock = match || (text.includes('\n'));

    if (!isBlock) {
        return (
            <code
                className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono"
                dir="ltr"
                {...props}
            >
                {children}
            </code>
        );
    }

    const highlightCode = (code: string) => {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return escaped
            .replace(/\b(int|long|double|float|char|string|void|bool|if|else|for|while|return|main|using|namespace|include|std|vector|map|set|pair|push_back|size|length)\b/g, '<span class="text-blue-400 font-bold">$1</span>')
            .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="text-orange-300">$1</span>')
            .replace(/([-+*\/%&|^!=]+|&lt;|&gt;)/g, '<span class="text-white/40">$1</span>')
            .replace(/(&#47;&#47;.*)/g, '<span class="text-zinc-500 italic">$1</span>');
    };

    return (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl" dir="ltr">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">
                    {match?.[1] || 'Code Segment'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white group/btn"
                    title="Copy to clipboard"
                >
                    {isCopied ? <Check size={12} className="text-emerald-400 animate-in zoom-in" /> : <Copy size={12} className="group-hover/btn:scale-110 transition-transform" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono custom-scrollbar">
                <code
                    className={className}
                    dangerouslySetInnerHTML={{ __html: highlightCode(text) }}
                />
            </pre>
        </div>
    );
};

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    const hasArabic = containsArabic(content);
    const direction = getTextDirection(content);

    return (
        <div
            className={`prose prose-invert prose-sm max-w-none ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Customize code blocks - ALWAYS LTR
                    code: CodeBlock,
                    // Customize paragraphs with smarter RTL support
                    // Customize paragraphs with smarter RTL support
                    p({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        return (
                            <p
                                className="mb-2 last:mb-0 leading-relaxed"
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    unicodeBidi: 'plaintext'
                                }}
                            >
                                {children}
                            </p>
                        );
                    },
                    // Customize headings with RTL support
                    h1({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        return (
                            <h1
                                className="text-xl font-bold mb-2 mt-4 first:mt-0"
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </h1>
                        );
                    },
                    h2({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        return (
                            <h2
                                className="text-lg font-semibold mb-2 mt-3 first:mt-0"
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </h2>
                        );
                    },
                    h3({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        return (
                            <h3
                                className="text-base font-semibold mb-1.5 mt-2 first:mt-0"
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </h3>
                        );
                    },
                    // Customize lists with RTL support
                    ul({ children }) {
                        // Lists are tricky because children are <li>, but we usually want list alignment 
                        // to match the *majority* of content or just the first item.
                        // For now, let's look at the raw children content if possible, or default to checking the first few chars of content?
                        // Actually, 'children' here is likely a bunch of whitespace and <li> elements.
                        // Let's rely on individual <li> to set their direction, or use the parent content detection.

                        // We can't easily extract text from <ul> children because they are React Elements (li).
                        // Let's assume list direction matches the overall document logic or pass it down?
                        // Better: Check the first child's text content?
                        // Simplification: Use the pre-calculated 'direction' from the parent scope isn't available here easily inside this component map without props drilling.
                        // But we can check the *surrounding* context? No.

                        // Fallback: Check if ANY child has Arabic? expensive.
                        // Let's just use the `containsArabic` on the `content` prop of the parent Renderer if possible?
                        // The `MarkdownRenderer` has `content`. We can use `hasArabic` from the closure!
                        const isRTL = hasArabic; // Use the global content detection for the list container direction

                        return (
                            <ul
                                className={`list-disc mb-2 space-y-1 ${isRTL ? 'list-inside' : 'list-inside'}`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </ul>
                        );
                    },
                    ol({ children }) {
                        const isRTL = hasArabic;
                        return (
                            <ol
                                className={`list-decimal mb-2 space-y-1 ${isRTL ? 'list-inside' : 'list-inside'}`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </ol>
                        );
                    },
                    li({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        // List items should align based on their OWN content
                        return (
                            <li
                                className={isRTL ? 'mr-4' : 'ml-4'}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </li>
                        );
                    },
                    // Customize blockquotes with RTL support
                    blockquote({ children }) {
                        const text = getTextContent(children);
                        const isRTL = containsArabic(text);
                        return (
                            <blockquote
                                className={`${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-emerald-500/50 italic my-2 text-white/70`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {children}
                            </blockquote>
                        );
                    },
                    // Customize links
                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 underline"
                                dir="auto"
                            >
                                {children}
                            </a>
                        );
                    },
                    // Customize strong/bold
                    strong({ children }) {
                        return <strong className="font-semibold text-white">{children}</strong>;
                    },
                    // Customize emphasis/italic
                    em({ children }) {
                        return <em className="italic text-white/90">{children}</em>;
                    },
                    // Customize horizontal rule
                    hr() {
                        return <hr className="border-white/10 my-4" />;
                    },
                    // Customize tables
                    table({ children }) {
                        return (
                            <div className="overflow-x-auto my-2" dir="auto">
                                <table className="min-w-full border border-white/10 rounded">
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead({ children }) {
                        return <thead className="bg-white/5">{children}</thead>;
                    },
                    tbody({ children }) {
                        return <tbody>{children}</tbody>;
                    },
                    tr({ children }) {
                        return <tr className="border-b border-white/10">{children}</tr>;
                    },
                    th({ children }) {
                        return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
                    },
                    td({ children }) {
                        return <td className="px-3 py-2">{children}</td>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
// Import React for React.isValidElement
import React from 'react';
