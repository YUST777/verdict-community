import type { Page } from '../browser/BrowserPage';
import type { SymbolicatedStackFrame } from '../symbolicate-stacktrace';
export declare class ErrorWithStackFrame extends Error {
    symbolicatedStackFrames: SymbolicatedStackFrame[] | null;
    frame: number | null;
    chunk: number | null;
    name: string;
    delayRenderCall: SymbolicatedStackFrame[] | null;
    constructor({ message, symbolicatedStackFrames, frame, name, delayRenderCall, stack, chunk }: {
        message: string;
        symbolicatedStackFrames: SymbolicatedStackFrame[] | null;
        frame: number | null;
        chunk: number | null;
        name: string;
        delayRenderCall: SymbolicatedStackFrame[] | null;
        stack: string | undefined;
    });
}
export declare const handleJavascriptException: ({ page, onError, frame, }: {
    page: Page;
    frame: number | null;
    onError: (err: Error) => void;
}) => () => Promise<void>;
