"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code, Keyboard, ChevronDown } from "lucide-react";
import { useEditorStore, KeyBinding } from "@/hooks/contest/useEditorStore";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = "Code Editor" | "Shortcuts";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <div onClick={() => onChange(!checked)}
            className={`relative flex items-center cursor-pointer transition-colors duration-200 ${checked ? "bg-[#10B981]" : "bg-[#333333]"}`}
            style={{ width: "40px", height: "20px", borderRadius: "20px", flexShrink: 0 }}>
            <div className="bg-white rounded-full transition-all duration-200 shadow-sm"
                style={{ width: "14px", height: "14px", marginLeft: checked ? "23px" : "3px", borderRadius: "50%" }} />
        </div>
    );
}

function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (val: string) => void }) {
    return (
        <div className="relative group">
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white/5 hover:bg-white/10 text-white/80 text-sm px-3 py-1.5 pr-8 rounded-md outline-none cursor-pointer transition-colors w-full min-w-[100px]">
                {options.map((opt) => (<option key={opt} value={opt} className="bg-[#2a2a2a]">{opt}</option>))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none group-hover:text-white/80 transition-colors" />
        </div>
    );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("Code Editor");
    const { fontFamily, fontSize, fontLigatures, keyBinding, tabSize, wordWrap, lineNumbers, setSetting } = useEditorStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-[760px] h-[480px] max-w-[95vw] max-h-[90vh] bg-[#282828] rounded-2xl overflow-hidden flex shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10">
                        {/* Sidebar */}
                        <div className="w-[180px] sm:w-[220px] bg-[#222222] border-r border-white/5 flex flex-col shrink-0">
                            <div className="p-6 pb-2">
                                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                    Settings
                                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/20">Alt + S</span>
                                </h2>
                            </div>
                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {[{ name: "Code Editor", icon: Code }, { name: "Shortcuts", icon: Keyboard }].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.name;
                                    return (
                                        <button key={tab.name} onClick={() => setActiveTab(tab.name as Tab)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                            <span>{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                        {/* Content */}
                        <div className="flex-1 relative flex flex-col bg-[#282828]">
                            <div className="h-14 flex items-center justify-between px-8 border-b border-white/5">
                                <h3 className="text-sm font-medium text-white/90">{activeTab}</h3>
                                <button onClick={onClose} className="p-1 px-2 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {activeTab === "Code Editor" && (
                                    <div className="space-y-1 max-w-[480px]">
                                        {[
                                            { label: "Font", type: "select", val: fontFamily.split(',')[0].replace(/'/g, ""), set: (v: string) => setSetting("fontFamily", v === "Default" ? "'JetBrains Mono', monospace" : `'${v}', monospace`), opts: ["Default", "JetBrains Mono", "Fira Code", "Consolas"] },
                                            { label: "Font size", type: "select", val: `${fontSize}px`, set: (v: string) => setSetting("fontSize", parseInt(v)), opts: ["11px", "12px", "13px", "14px", "15px", "16px"] },
                                            { label: "Font ligatures", type: "toggle", val: fontLigatures, set: (v: boolean) => setSetting("fontLigatures", v) },
                                            { label: "Key binding", type: "select", val: keyBinding, set: (v: string) => setSetting("keyBinding", v as KeyBinding), opts: ["Standard", "Vim"] },
                                            { label: "Tab size", type: "select", val: `${tabSize} spaces`, set: (v: string) => setSetting("tabSize", parseInt(v)), opts: ["2 spaces", "4 spaces", "8 spaces"] },
                                            { label: "Word Wrap", type: "toggle", val: wordWrap === "on", set: (v: boolean) => setSetting("wordWrap", v ? "on" : "off") },
                                            { label: "Relative Line Number", type: "toggle", val: lineNumbers === "relative", set: (v: boolean) => setSetting("lineNumbers", v ? "relative" : "on") },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                                <span className="text-sm text-white/80 font-medium">{item.label}</span>
                                                {item.type === "select" ? (
                                                    <Dropdown value={item.val as string} onChange={item.set as any} options={item.opts as string[]} />
                                                ) : (
                                                    <Toggle checked={item.val as boolean} onChange={item.set as any} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "Shortcuts" && (
                                    <div className="space-y-6">
                                        {[
                                            { title: "General", items: [
                                                { label: "Run Code", key: "Ctrl + '" },
                                                { label: "Submit to CF", key: "Ctrl + Enter" },
                                                { label: "Toggle Notes", key: "Alt + N" },
                                                { label: "Problem List", key: "Alt + P" },
                                                { label: "Full Screen", key: "Alt + F" },
                                                { label: "Settings", key: "Alt + S" },
                                            ]},
                                            { title: "Code Editor", items: [
                                                { label: "Indent / Outdent", key: "Tab / Shift+Tab" },
                                                { label: "Move Lines", key: "Alt + ↑/↓" },
                                                { label: "Delete Line", key: "Ctrl + X" },
                                                { label: "Comment", key: "Ctrl + /" },
                                                { label: "Undo / Redo", key: "Ctrl + Z / Shift+Z" },
                                            ]},
                                        ].map((section) => (
                                            <div key={section.title} className="space-y-2">
                                                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-3">{section.title}</h4>
                                                <div className="space-y-1">
                                                    {section.items.map((item) => (
                                                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                            <span className="text-sm text-white/70">{item.label}</span>
                                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                                {item.key.split(" / ").map((variant, vIdx) => (
                                                                    <div key={vIdx} className="flex gap-1 items-center">
                                                                        {vIdx > 0 && <span className="text-[10px] text-white/20">or</span>}
                                                                        {variant.split(" + ").map((k) => (
                                                                            <kbd key={k} className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-[10px] text-white/50 font-mono shadow-sm">{k}</kbd>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;
    return createPortal(modal, document.body);
}
