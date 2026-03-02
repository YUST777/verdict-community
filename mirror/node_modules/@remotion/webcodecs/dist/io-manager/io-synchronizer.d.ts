import type { WebCodecsController } from '../webcodecs-controller';
export declare const makeIoSynchronizer: ({ logLevel, label, controller, }: {
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    label: string;
    controller: WebCodecsController | null;
}) => {
    inputItem: (timestamp: number) => void;
    onOutput: (timestamp: number) => void;
    waitForQueueSize: (queueSize: number) => Promise<void>;
    clearQueue: () => void;
};
export type IoSynchronizer = ReturnType<typeof makeIoSynchronizer>;
