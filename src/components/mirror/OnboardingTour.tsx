'use client';

import { useEffect, useCallback, useState } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { renderToString } from 'react-dom/server';
import { BookOpen, MonitorPlay, BarChart2, Sparkles, TerminalSquare, Puzzle, Timer, Settings } from 'lucide-react';

const ONBOARDING_STORAGE_KEY = 'verdict-onboarding-completed';

interface OnboardingTourProps {
    delay?: number;
    forceShow?: boolean;
    onComplete?: () => void;
}

const renderIcon = (IconComponent: React.ElementType) => {
    const Icon = IconComponent as React.ComponentType<{ size?: number; strokeWidth?: number }>;
    return renderToString(
        <span className="inline-flex items-center justify-center bg-white/10 rounded-lg p-1.5 mr-2 -mt-1 shadow-sm border border-white/5 text-emerald-400">
            <Icon size={20} strokeWidth={2} />
        </span>
    );
};

export default function OnboardingTour({
    delay = 2000,
    forceShow = false,
    onComplete,
}: OnboardingTourProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (hasSeen && !forceShow) return;
        if (typeof window !== 'undefined' && window.innerWidth < 768) return;
        const timer = setTimeout(() => setReady(true), delay);
        return () => clearTimeout(timer);
    }, [delay, forceShow]);

    const markCompleted = useCallback(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        onComplete?.();
    }, [onComplete]);

    const startTour = useCallback(() => {
        const steps: DriveStep[] = [
            // Step 1: Welcome — left panel
            {
                element: '#onboarding-left-panel',
                popover: {
                    title: `${renderIcon(BookOpen)}<span class="align-middle">Welcome to Verdict!</span>`,
                    description: 'This is your workspace. On the left you\'ll find the problem statement, submissions, analytics, and AI tutor. Let\'s take a quick tour!',
                    side: 'right' as const,
                    align: 'center' as const,
                },
            },
            // Step 2: Code Editor
            {
                element: '#onboarding-code-workspace',
                popover: {
                    title: `${renderIcon(MonitorPlay)}<span class="align-middle">Code Editor</span>`,
                    description: 'Write your solution in a full-featured editor with syntax highlighting, autocomplete, and customizable settings. Supports C++, Python, Java, and more.',
                    side: 'left' as const,
                    align: 'center' as const,
                },
            },
            // Step 3: Test Cases Panel
            {
                element: '#onboarding-test-panel',
                popover: {
                    title: `${renderIcon(TerminalSquare)}<span class="align-middle">Test Cases</span>`,
                    description: 'Run your code against example test cases or add custom ones. Results show up instantly with diff highlighting.',
                    side: 'top' as const,
                    align: 'center' as const,
                },
            },
            // Step 4: Analytics tab
            {
                element: '#onboarding-tab-analytics',
                popover: {
                    title: `${renderIcon(BarChart2)}<span class="align-middle">Performance Analytics</span>`,
                    description: 'See runtime and memory distributions across all accepted solutions. Compare your performance with the global leaderboard.',
                    side: 'bottom' as const,
                    align: 'start' as const,
                },
            },
            // Step 5: AI Tutor tab
            {
                element: '#onboarding-tab-ai-tutor',
                popover: {
                    title: `${renderIcon(Sparkles)}<span class="align-middle">AI Tutor</span>`,
                    description: 'Stuck on a problem? The AI tutor generates step-by-step solutions with explanations, concepts, and video resources.',
                    side: 'bottom' as const,
                    align: 'start' as const,
                },
            },
            // Step 6: Header actions (Settings, Timer, Streak)
            {
                element: '#onboarding-header-actions',
                popover: {
                    title: `${renderIcon(Settings)}<span class="align-middle">Your Toolkit</span>`,
                    description: 'Customize your editor settings, track your streak, and use the built-in stopwatch/timer for practice sessions. Hover any icon for keyboard shortcuts.',
                    side: 'bottom' as const,
                    align: 'end' as const,
                },
            },
            // Step 7: Submit button — Extension CTA
            {
                element: '#onboarding-submit-btn',
                popover: {
                    title: `${renderIcon(Puzzle)}<span class="align-middle">One-Click Submits</span>`,
                    description: 'Submit directly to Codeforces with one click. Install the Verdict Helper extension to enable this.',
                    onNextClick: () => {
                        window.open(
                            'https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj',
                            '_blank'
                        );
                        driverInstance.destroy();
                        markCompleted();
                    },
                },
            },
        ];

        const driverInstance = driver({
            showProgress: true,
            animate: true,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            stagePadding: 8,
            stageRadius: 8,
            allowClose: true,
            doneBtnText: 'Install Extension →',
            nextBtnText: 'Next →',
            prevBtnText: '← Back',
            progressText: '{{current}} of {{total}}',
            steps,
            onDestroyed: () => {
                markCompleted();
            },
        });

        requestAnimationFrame(() => {
            driverInstance.drive();
        });
    }, [markCompleted]);

    useEffect(() => {
        if (ready) startTour();
    }, [ready, startTour]);

    return null;
}

export function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}
