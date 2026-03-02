import type { CreateAudioDecoderInit, WebCodecsAudioDecoder } from './create-audio-decoder';
export declare const getWaveAudioDecoder: ({ onFrame, config, sampleFormat, ioSynchronizer, onError, }: Pick<CreateAudioDecoderInit, "config" | "onFrame"> & {
    sampleFormat: "s16" | "s24";
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    ioSynchronizer: {
        inputItem: (timestamp: number) => void;
        onOutput: (timestamp: number) => void;
        waitForQueueSize: (queueSize: number) => Promise<void>;
        clearQueue: () => void;
    };
    onError: (error: Error) => void;
}) => WebCodecsAudioDecoder;
