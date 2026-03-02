'use client';

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUp, Paperclip, Square, X, Library, Loader2, Wand2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIContextCircle } from "@/components/ui/ai-context-usage";

// ─── Textarea ───────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
    <textarea
        className={cn(
            "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-400/70 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
            className
        )}
        ref={ref}
        rows={1}
        {...props}
    />
));
Textarea.displayName = "Textarea";

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "z-50 overflow-hidden rounded-md border border-white/[0.06] bg-[#1a1a1a] px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95",
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ─── Dialog ──────────────────────────────────────────────────────────────────
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/[0.06] bg-[#1a1a1a] p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out rounded-2xl", className)}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-white/[0.06] p-2 hover:bg-white/[0.10] transition-all">
                <X className="h-5 w-5 text-gray-200" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-gray-100", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// ─── Button ───────────────────────────────────────────────────────────────────
interface PButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost";
    size?: "icon";
}
const PButton = React.forwardRef<HTMLButtonElement, PButtonProps>(
    ({ className, variant = "default", size = "icon", ...props }, ref) => (
        <button
            className={cn(
                "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                variant === "default" && "bg-white hover:bg-white/80 text-black",
                variant === "ghost" && "bg-transparent hover:bg-white/10 text-white/60 hover:text-white",
                size === "icon" && "h-8 w-8 rounded-full",
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
PButton.displayName = "PButton";

// ─── ImageViewDialog ──────────────────────────────────────────────────────────
const ImageViewDialog: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <Dialog open={!!imageUrl} onOpenChange={onClose}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
                <DialogTitle className="sr-only">Image Preview</DialogTitle>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Full preview" className="w-full max-h-[80vh] object-contain rounded-2xl" />
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

// ─── PromptInput Context ──────────────────────────────────────────────────────
interface PromptInputContextType {
    isLoading: boolean;
    value: string;
    setValue: (value: string) => void;
    maxHeight: number | string;
    onSubmit?: () => void;
    disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
    isLoading: false, value: "", setValue: () => { }, maxHeight: 240, onSubmit: undefined, disabled: false,
});
function usePromptInput() { return React.useContext(PromptInputContext); }

interface PromptInputProps {
    isLoading?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
    maxHeight?: number | string;
    onSubmit?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
    ({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false, onDragOver, onDragLeave, onDrop }, ref) => {
        const [internalValue, setInternalValue] = React.useState(value || "");
        const handleChange = (v: string) => { setInternalValue(v); onValueChange?.(v); };
        return (
            <TooltipProvider>
                <PromptInputContext.Provider value={{ isLoading, value: value ?? internalValue, setValue: onValueChange ?? handleChange, maxHeight, onSubmit, disabled }}>
                    <div
                        ref={ref}
                        className={cn("rounded-2xl border border-white/[0.06] bg-[#1a1a1a] p-2 transition-all duration-300", isLoading && "border-white/[0.08]", className)}
                        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    >
                        {children}
                    </div>
                </PromptInputContext.Provider>
            </TooltipProvider>
        );
    }
);
PromptInput.displayName = "PromptInput";

const PromptInputTextarea: React.FC<{ disableAutosize?: boolean; placeholder?: string } & React.ComponentProps<typeof Textarea>> = ({
    className, onKeyDown, disableAutosize = false, placeholder, ...props
}) => {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (disableAutosize || !textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
            typeof maxHeight === "number"
                ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
                : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
    }, [value, maxHeight, disableAutosize]);

    return (
        <Textarea
            ref={textareaRef} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit?.(); } onKeyDown?.(e); }}
            className={cn("text-sm", className)}
            {...props}
        />
    );
};

// ─── Custom Divider ───────────────────────────────────────────────────────────
const CustomDivider: React.FC = () => (
    <div className="h-4 w-[1px] bg-white/10 mx-0.5 rounded-full" />
);

// ─── Main PromptInputBox ──────────────────────────────────────────────────────
export interface PromptInputBoxProps {
    onSend?: (message: string, files?: File[]) => void;
    onStop?: () => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
    onOpenResources?: () => void;
    onTeachMe?: () => void;
    isTutorLoading?: boolean;
    isTutorActive?: boolean;
    hasUsedTutor?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    onExplainVideo?: () => void;
    isVideoLoading?: boolean;
}

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
    const { onSend = () => { }, onStop, isLoading = false, placeholder = "Ask anything...", className, onOpenResources, onTeachMe, isTutorLoading, isTutorActive, hasUsedTutor, value, onChange } = props;
    const [internalInput, setInternalInput] = React.useState("");

    // Use controlled value if provided, else internal state
    const input = value !== undefined ? value : internalInput;
    const handleInputChange = (newVal: string) => {
        if (value === undefined) setInternalInput(newVal);
        onChange?.(newVal);
    };
    const [files, setFiles] = React.useState<File[]>([]);
    const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({});
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
    const uploadInputRef = React.useRef<HTMLInputElement>(null);
    const promptBoxRef = React.useRef<HTMLDivElement>(null);

    const isImageFile = (file: File) => file.type.startsWith("image/");

    const processFile = (file: File) => {
        if (!isImageFile(file) || file.size > 10 * 1024 * 1024) return;
        setFiles([file]);
        const reader = new FileReader();
        reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
        reader.readAsDataURL(file);
    };

    const handlePaste = React.useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) { e.preventDefault(); processFile(file); break; }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [handlePaste]);

    const handleSubmit = () => {
        if (!input.trim() && files.length === 0) return;
        onSend(input, files);
        if (value === undefined) setInternalInput("");
        onChange?.("");
        setFiles([]); setFilePreviews({});
    };

    const hasContent = input.trim() !== "" || files.length > 0;

    return (
        <>
            <PromptInput
                value={input} onValueChange={handleInputChange} isLoading={isLoading} onSubmit={handleSubmit}
                className={cn("w-full", className)}
                disabled={isLoading}
                ref={(ref as React.RefObject<HTMLDivElement>) || promptBoxRef}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const dropped = Array.from(e.dataTransfer.files).filter(isImageFile);
                    if (dropped.length > 0) processFile(dropped[0]);
                }}
            >
                {/* File previews */}
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2 px-1">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                {isImageFile(file) && filePreviews[file.name] && (
                                    <div className="w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-white/[0.06]" onClick={() => setSelectedImage(filePreviews[file.name])}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={filePreviews[file.name]} alt={file.name} className="h-full w-full object-cover" />
                                        <button onClick={(e) => { e.stopPropagation(); setFiles([]); setFilePreviews({}); }} className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5">
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Textarea */}
                <PromptInputTextarea
                    placeholder={placeholder}
                    className="text-sm px-2"
                />

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between gap-2 pt-1 px-1">
                    {/* Left — mode toggles + attach */}
                    <div className="flex items-center gap-0.5">
                        {/* Attach */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => uploadInputRef.current?.click()}
                                    className="flex h-7 w-7 text-white/30 items-center justify-center rounded-lg transition-colors hover:bg-white/5 hover:text-white/60"
                                >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <input ref={uploadInputRef} type="file" className="hidden" accept="image/*"
                                        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); if (e.target) e.target.value = ""; }} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Attach image</TooltipContent>
                        </Tooltip>

                        <CustomDivider />

                        {/* Resources button */}
                        {onOpenResources && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onOpenResources}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 h-7 text-[11px] font-medium transition-colors bg-[#2cbb5d]/10 hover:bg-[#2cbb5d]/15 border border-[#2cbb5d]/20 text-[#2cbb5d]"
                            >
                                <Library className="w-3.5 h-3.5" />
                                <span>Resources</span>
                            </motion.button>
                        )}

                        {/* Teach Me button */}
                        {onTeachMe && !hasUsedTutor && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={onTeachMe}
                                disabled={isTutorLoading || isTutorActive || isLoading}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 h-7 text-[11px] font-medium transition-colors bg-[#2cbb5d]/10 hover:bg-[#2cbb5d]/15 border border-[#2cbb5d]/20 text-[#2cbb5d] ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTutorLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                <span>Teach Me</span>
                            </motion.button>
                        )}

                        {/* Explain with Video button */}
                        {props.onExplainVideo && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={props.onExplainVideo}
                                disabled={props.isVideoLoading || isLoading}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 h-7 text-[11px] font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {props.isVideoLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                <span>Explain with Video</span>
                            </motion.button>
                        )}
                    </div>

                    {/* Right — context circle + send */}
                    <div className="flex items-center gap-1">
                        <AIContextCircle />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {isLoading ? (
                                    <PButton
                                        variant="default"
                                        size="icon"
                                        className="h-7 w-7 transition-all duration-200 bg-[#ef4743]/10 hover:bg-[#ef4743]/15 text-[#ef4743] border border-[#ef4743]/20"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onStop?.();
                                        }}
                                    >
                                        <Square className="h-3 w-3 fill-current" />
                                    </PButton>
                                ) : (
                                    <PButton
                                        variant={hasContent ? "default" : "ghost"}
                                        size="icon"
                                        className="h-7 w-7 transition-all duration-200"
                                        onClick={handleSubmit}
                                        disabled={!hasContent}
                                    >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </PButton>
                                )}
                            </TooltipTrigger>
                            <TooltipContent>{isLoading ? "Stop generating" : "Send"}</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </PromptInput>

            <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </>
    );
});
PromptInputBox.displayName = "PromptInputBox";
