import type { WebCodecsController } from './webcodecs-controller';
export type WebCodecsVideoDecoder = {
    decode: (videoSample: EncodedVideoChunkInit | EncodedVideoChunk) => Promise<void>;
    close: () => void;
    flush: () => Promise<void>;
    waitForQueueToBeLessThan: (items: number) => Promise<void>;
    reset: () => void;
    checkReset: () => {
        wasReset: () => boolean;
    };
    getMostRecentSampleInput: () => number | null;
};
export declare const internalCreateVideoDecoder: ({ onFrame, onError, controller, config, logLevel, }: {
    onFrame: (frame: VideoFrame) => void | Promise<void>;
    onError: (error: Error) => void;
    controller: WebCodecsController | null;
    config: VideoDecoderConfig;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => Promise<WebCodecsVideoDecoder>;
export declare const createVideoDecoder: ({ onFrame, onError, controller, track, logLevel, }: {
    track: VideoDecoderConfig;
    onFrame: (frame: VideoFrame) => void | Promise<void>;
    onError: (error: Error) => void;
    controller?: WebCodecsController | undefined;
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
}) => Promise<WebCodecsVideoDecoder>;
