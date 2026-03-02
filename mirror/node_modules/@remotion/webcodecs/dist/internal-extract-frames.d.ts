import type { MediaParserContainer, MediaParserVideoTrack, ParseMedia } from '@remotion/media-parser';
import type { ParseMediaOnWorker } from '@remotion/media-parser/worker';
export type ExtractFramesTimestampsInSecondsFn = (options: {
    track: MediaParserVideoTrack;
    container: MediaParserContainer;
    durationInSeconds: number | null;
}) => Promise<number[]> | number[];
export declare const internalExtractFrames: ({ src, onFrame, signal, timestampsInSeconds, acknowledgeRemotionLicense, logLevel, parseMediaImplementation, }: {
    timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
    src: string;
    onFrame: (frame: VideoFrame) => void;
    signal: AbortSignal | null;
    acknowledgeRemotionLicense: boolean;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    parseMediaImplementation: ParseMedia | ParseMediaOnWorker;
}) => Promise<void>;
