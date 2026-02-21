'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Puzzle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    EditorMockup,
    AITutorMockup,
    ExtensionMockup,
    AnalyticsMockup
} from '@/components/ui/mockups';

// ============================================================================
// MOCKED SHADCN / ORIGIN UI COMPONENTS
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost", size?: "default" | "sm" | "icon" }>(
    ({ className, variant = "default", size = "default", type = "button", children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50";

        const variants = {
            default: "bg-emerald-500 text-black shadow-sm hover:bg-emerald-400 font-semibold",
            outline: "border border-white/10 bg-transparent shadow-sm hover:bg-white/5 text-white",
            ghost: "hover:bg-white/10 text-white",
        };

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-lg px-3 text-xs",
            icon: "h-9 w-9",
        };

        return (
            <button
                ref={ref}
                type={type}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />
            <div className="z-[101] flex w-full justify-center animate-in fade-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ children, className, onClose }: { children: React.ReactNode, className?: string, onClose?: () => void }) => (
    <div className={cn(
        "relative grid w-full gap-4 overflow-y-auto border border-white/10 bg-[#0a0a0a] text-white shadow-lg shadow-black/50 sm:max-w-[400px] sm:rounded-xl",
        className
    )}>
        {children}
        {onClose && (
            <button
                onClick={onClose}
                className="group absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg outline-offset-2 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none z-10 bg-black/20 backdrop-blur-md border border-white/10 sm:bg-transparent sm:border-none sm:backdrop-blur-none"
            >
                <X className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                <span className="sr-only">Close</span>
            </button>
        )}
    </div>
);

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
        {children}
    </div>
);

const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h2 className={cn("text-lg font-semibold tracking-tight", className)}>
        {children}
    </h2>
);

const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <p className={cn("text-sm text-white/60", className)}>
        {children}
    </p>
);

const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}>
        {children}
    </div>
);

// ============================================================================
// VERDICT ONBOARDING MODAL
// ============================================================================

export default function ExtensionOnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    const stepContent = [
        {
            title: "Welcome to Verdict",
            description: "Unlock the full power of competitive programming directly within your workspace.",
            component: <EditorMockup />
        },
        {
            title: "Everything You Need",
            description: "Read Codeforces problems, use an AI Tutor, write in a VS Code-like editor, and track your stats.",
            component: <AITutorMockup />
        },
        {
            title: "Performance Insights",
            description: "See runtime and memory distributions across all accepted solutions. Compare your results.",
            component: <AnalyticsMockup />
        },
        {
            title: "You're All Set!",
            description: "Install our browser assistant to enable One-Click Submissions and mirror problems.",
            component: <ExtensionMockup />
        }
    ];

    const totalSteps = stepContent.length;

    useEffect(() => {
        const hasSeen = localStorage.getItem('verdict-extension-onboarding-seen');
        if (hasSeen) return;

        const isInstalled = document.getElementById('verdict-extension-installed');
        if (isInstalled) return;

        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('verdict-extension-onboarding-seen', 'true');
        // Reset step after closing animation
        setTimeout(() => setStep(1), 300);
    };

    const handleContinue = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleFinal = () => {
        handleClose();
        window.open('https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj', '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent className="gap-0 p-0 [&>button:last-child]:text-white" onClose={handleClose}>
                {/* Graphic Section */}
                <div className="relative h-[240px] w-full overflow-hidden bg-[#0d0d0d] rounded-t-xl">
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                    </div>
                    {stepContent[step - 1].component}
                </div>

                {/* Content Section */}
                <div className="space-y-6 px-6 pb-6 pt-3 bg-[#0a0a0a]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{stepContent[step - 1].title}</DialogTitle>
                        <DialogDescription className="min-h-[40px]">
                            {stepContent[step - 1].description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        {/* Pagination Dots */}
                        <div className="flex justify-center space-x-1.5 max-sm:order-1">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                        index + 1 === step ? "bg-emerald-500 w-3" : "bg-white/20"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Footer Buttons */}
                        <DialogFooter>
                            <Button variant="ghost" onClick={handleClose}>
                                Skip
                            </Button>

                            {step < totalSteps ? (
                                <Button className="group" onClick={handleContinue}>
                                    Next
                                    <ArrowRight
                                        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                                        size={16}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </Button>
                            ) : (
                                <Button onClick={handleFinal}>
                                    Install Assistant
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
