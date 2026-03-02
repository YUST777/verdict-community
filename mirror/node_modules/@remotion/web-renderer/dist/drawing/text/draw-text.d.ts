import type { DrawFn } from '../drawn-fn';
export declare const drawText: ({ span, logLevel, onlyBackgroundClipText, parentRect, }: {
    span: HTMLSpanElement;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    parentRect: DOMRect;
    onlyBackgroundClipText: boolean;
}) => DrawFn;
