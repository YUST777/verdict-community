import type { IoSynchronizer } from './io-manager/io-synchronizer';
import type { WebCodecsController } from './webcodecs-controller';
export type WebCodecsVideoEncoder = {
    encode: (videoFrame: VideoFrame) => void;
    waitForFinish: () => Promise<void>;
    close: () => void;
    flush: () => Promise<void>;
    ioSynchronizer: IoSynchronizer;
};
export declare const createVideoEncoder: ({ onChunk, onError, controller, config, logLevel, outputCodec, keyframeInterval, }: {
    onChunk: (chunk: EncodedVideoChunk, metadata: EncodedVideoChunkMetadata | null) => Promise<void>;
    onError: (error: Error) => void;
    controller: WebCodecsController;
    config: VideoEncoderConfig;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    outputCodec: "h264" | "h265" | "vp8" | "vp9";
    keyframeInterval: number;
}) => WebCodecsVideoEncoder;
