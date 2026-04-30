"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Clock, Play, Pause, RotateCcw } from "lucide-react";

type Mode = "stopwatch" | "timer";

export function TimerDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("stopwatch");
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, right: 0 });

    const [swRunning, setSwRunning] = useState(false);
    const [swElapsed, setSwElapsed] = useState(0);
    const swIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const swStartRef = useRef(0);

    const [timerHours, setTimerHours] = useState(1);
    const [timerMinutes, setTimerMinutes] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerRemaining, setTimerRemaining] = useState(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerEndRef = useRef(0);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(e.target as Node)
            ) setIsOpen(false);
        };
        if (isOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    const startStopwatch = useCallback(() => {
        if (swRunning) return;
        setSwRunning(true);
        swStartRef.current = Date.now() - swElapsed;
        swIntervalRef.current = setInterval(() => setSwElapsed(Date.now() - swStartRef.current), 50);
    }, [swRunning, swElapsed]);

    const pauseStopwatch = useCallback(() => {
        setSwRunning(false);
        if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }, []);

    const resetStopwatch = useCallback(() => {
        setSwRunning(false); setSwElapsed(0);
        if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }, []);

    const startTimer = useCallback(() => {
        const totalMs = (timerHours * 3600 + timerMinutes * 60) * 1000;
        if (totalMs <= 0 && timerRemaining <= 0) return;
        if (timerRunning) return;
        setTimerRunning(true);
        const remaining = timerRemaining > 0 ? timerRemaining : totalMs;
        timerEndRef.current = Date.now() + remaining;
        setTimerRemaining(remaining);
        timerIntervalRef.current = setInterval(() => {
            const left = timerEndRef.current - Date.now();
            if (left <= 0) {
                setTimerRemaining(0); setTimerRunning(false);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            } else setTimerRemaining(left);
        }, 50);
    }, [timerHours, timerMinutes, timerRunning, timerRemaining]);

    const pauseTimer = useCallback(() => {
        setTimerRunning(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }, []);

    const resetTimer = useCallback(() => {
        setTimerRunning(false); setTimerRemaining(0);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }, []);

    useEffect(() => {
        return () => {
            if (swIntervalRef.current) clearInterval(swIntervalRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const displayValue = swRunning || swElapsed > 0 ? formatTime(swElapsed) : timerRunning || timerRemaining > 0 ? formatTime(timerRemaining) : null;
    const isActive = swRunning || timerRunning;

    const dropdown = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed w-[300px] bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    style={{ top: pos.top, right: pos.right, zIndex: 9999 }}
                >
                    <div className="p-3 flex gap-2">
                        <motion.button onClick={() => setMode("stopwatch")}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${mode === "stopwatch" ? "border-white/20 bg-white/5" : "border-white/5 hover:border-white/10"}`}
                            whileTap={{ scale: 0.97 }}>
                            <Timer size={28} className={mode === "stopwatch" ? "text-[#3B82F6]" : "text-white/40"} />
                            <span className={`text-xs font-medium ${mode === "stopwatch" ? "text-white" : "text-white/40"}`}>Stopwatch</span>
                        </motion.button>
                        <motion.button onClick={() => setMode("timer")}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${mode === "timer" ? "border-white/20 bg-white/5" : "border-white/5 hover:border-white/10"}`}
                            whileTap={{ scale: 0.97 }}>
                            <Clock size={28} className={mode === "timer" ? "text-[#F59E0B]" : "text-white/40"} />
                            <span className={`text-xs font-medium ${mode === "timer" ? "text-white" : "text-white/40"}`}>Timer</span>
                        </motion.button>
                    </div>
                    <div className="px-3 pb-3">
                        {mode === "stopwatch" ? (
                            <div className="space-y-3">
                                <div className="text-center py-3">
                                    <span className="text-3xl font-mono font-bold text-white tabular-nums">{formatTime(swElapsed)}</span>
                                </div>
                                <div className="flex gap-2">
                                    {swRunning ? (
                                        <button onClick={pauseStopwatch} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium text-sm">
                                            <Pause size={16} /> Pause
                                        </button>
                                    ) : (
                                        <button onClick={startStopwatch} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium text-sm">
                                            <Play size={16} fill="currentColor" /> {swElapsed > 0 ? "Resume" : "Start Stopwatch"}
                                        </button>
                                    )}
                                    {swElapsed > 0 && (
                                        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={resetStopwatch}
                                            className="w-10 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/60 rounded-lg transition-colors">
                                            <RotateCcw size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {!timerRunning && timerRemaining === 0 ? (
                                    <div className="flex items-center justify-center gap-2 py-3">
                                        <input type="number" min={0} max={23} value={timerHours}
                                            onChange={(e) => setTimerHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                            className="w-14 h-12 text-center text-2xl font-mono font-bold bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        <span className="text-xs text-white/40 font-medium">hr</span>
                                        <input type="number" min={0} max={59} value={timerMinutes}
                                            onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                            className="w-14 h-12 text-center text-2xl font-mono font-bold bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        <span className="text-xs text-white/40 font-medium">min</span>
                                    </div>
                                ) : (
                                    <div className="text-center py-3">
                                        <span className="text-3xl font-mono font-bold text-white tabular-nums">{formatTime(timerRemaining)}</span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    {timerRunning ? (
                                        <button onClick={pauseTimer} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium text-sm">
                                            <Pause size={16} /> Pause
                                        </button>
                                    ) : (
                                        <button onClick={startTimer} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium text-sm">
                                            <Play size={16} fill="currentColor" /> {timerRemaining > 0 ? "Resume" : "Start Timer"}
                                        </button>
                                    )}
                                    {timerRemaining > 0 && (
                                        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={resetTimer}
                                            className="w-10 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/60 rounded-lg transition-colors">
                                            <RotateCcw size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {displayValue && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            className="border-t border-white/10 px-3 py-2 flex items-center justify-between">
                            <span className="text-xs text-white/40">{swRunning || swElapsed > 0 ? "Stopwatch" : "Timer"}</span>
                            <span className="text-sm font-mono font-bold text-white tabular-nums">{displayValue}</span>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}
                className={`w-9 h-full flex items-center justify-center transition-colors ${isOpen || isActive ? "bg-white/10 text-[#3B82F6]" : "hover:bg-white/10"}`}
                title="Timer">
                <Timer size={16} className={isActive ? "text-[#3B82F6]" : ""} />
            </button>
            {typeof document !== "undefined" && createPortal(dropdown, document.body)}
        </>
    );
}
