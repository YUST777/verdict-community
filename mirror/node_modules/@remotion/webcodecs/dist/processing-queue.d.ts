import type { LogLevel } from './log';
import type { WebCodecsController } from './webcodecs-controller';
type Processable = EncodedAudioChunk | EncodedVideoChunk | AudioData | VideoFrame;
export declare function processingQueue<T extends Processable>({ onOutput, logLevel, label, onError, controller }: {
    onOutput: (item: T) => Promise<void>;
    onError: (error: Error) => void;
    logLevel: LogLevel;
    label: string;
    controller: WebCodecsController;
}): {
    input: (item: T) => void;
    ioSynchronizer: {
        inputItem: (timestamp: number) => void;
        onOutput: (timestamp: number) => void;
        waitForQueueSize: (queueSize: number) => Promise<void>;
        clearQueue: () => void;
    };
};
export {};
