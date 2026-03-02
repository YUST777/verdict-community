import type { MediaParserLogLevel } from '@remotion/media-parser';
import type { WebCodecsController } from './webcodecs-controller';
export type WebCodecsAudioDecoder = {
    decode: (audioSample: EncodedAudioChunkInit | EncodedAudioChunk) => Promise<void>;
    close: () => void;
    flush: () => Promise<void>;
    waitForQueueToBeLessThan: (items: number) => Promise<void>;
    reset: () => void;
    checkReset: () => {
        wasReset: () => boolean;
    };
    getMostRecentSampleInput: () => number | null;
};
export type CreateAudioDecoderInit = {
    onFrame: (frame: AudioData) => Promise<void> | void;
    onError: (error: Error) => void;
    controller: WebCodecsController | null;
    config: AudioDecoderConfig;
    logLevel: MediaParserLogLevel;
};
export declare const internalCreateAudioDecoder: ({ onFrame, onError, controller, config, logLevel, }: CreateAudioDecoderInit) => Promise<WebCodecsAudioDecoder>;
export declare const createAudioDecoder: ({ track, onFrame, onError, controller, logLevel, }: {
    track: AudioDecoderConfig;
    onFrame: (frame: AudioData) => void | Promise<void>;
    onError: (error: Error) => void;
    controller?: WebCodecsController | null | undefined;
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
}) => Promise<WebCodecsAudioDecoder>;
