import type { AudioEncoderInit, WebCodecsAudioEncoder } from './audio-encoder';
export declare const getWaveAudioEncoder: ({ onChunk, controller, config, ioSynchronizer, }: Pick<AudioEncoderInit, "config" | "controller" | "onChunk"> & {
    ioSynchronizer: {
        inputItem: (timestamp: number) => void;
        onOutput: (timestamp: number) => void;
        waitForQueueSize: (queueSize: number) => Promise<void>;
        clearQueue: () => void;
    };
}) => WebCodecsAudioEncoder;
