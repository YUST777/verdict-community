import type { CompositorCommand } from './payloads';
export type Compositor = {
    shutDownOrKill: () => Promise<void>;
    finishCommands: () => Promise<void>;
    executeCommand: <T extends keyof CompositorCommand>(type: T, payload: CompositorCommand[T]) => Promise<Uint8Array>;
    waitForDone: () => Promise<void>;
    pid: number | null;
};
export declare const startLongRunningCompositor: ({ maximumFrameCacheItemsInBytes, logLevel, indent, binariesDirectory, extraThreads, }: {
    maximumFrameCacheItemsInBytes: number | null;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    binariesDirectory: string | null;
    extraThreads: number;
}) => Compositor;
export declare const startCompositor: <T extends keyof CompositorCommand>({ type, payload, logLevel, indent, binariesDirectory, }: {
    type: T;
    payload: CompositorCommand[T];
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    indent: boolean;
    binariesDirectory: string | null;
}) => Compositor;
