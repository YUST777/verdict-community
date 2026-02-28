'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function TestCasesLoader({ customText }: { customText?: string }) {
    const caseCount = 4;
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % (caseCount + 2));
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
                {[...Array(caseCount)].map((_, i) => {
                    let status: 'pending' | 'running' | 'accepted' = 'pending';
                    if (i < activeIndex) status = 'accepted';
                    if (i === activeIndex) status = 'running';
                    if (activeIndex >= caseCount) status = 'accepted';

                    return <TestCaseDot key={i} status={status} />;
                })}
            </div>
            <div className="h-8 mt-2">
                <motion.span
                    key={customText ? customText : (activeIndex < caseCount ? "running" : "done")}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[16px] font-mono text-white/30 uppercase tracking-wider"
                >
                    {customText || (activeIndex < caseCount ? `Running Test ${activeIndex + 1}...` : 'Accepted')}
                </motion.span>
            </div>
        </div>
    );
}

function TestCaseDot({ status }: { status: 'pending' | 'running' | 'accepted' }) {
    const variants = {
        pending: { backgroundColor: '#1a1a1a', scale: 1, boxShadow: 'none' },
        running: {
            backgroundColor: '#10b981',
            scale: 1.3,
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)'
        },
        accepted: {
            backgroundColor: '#34d399',
            scale: 1,
            boxShadow: '0 0 6px rgba(52, 211, 153, 0.3)'
        }
    };

    return (
        <motion.div
            initial="pending"
            animate={status}
            variants={variants}
            transition={{ duration: 0.2 }}
            className="w-[27px] h-[27px] rounded-[4px]"
        />
    );
}
