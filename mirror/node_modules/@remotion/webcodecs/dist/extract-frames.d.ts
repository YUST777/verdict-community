import { type MediaParserLogLevel } from '@remotion/media-parser';
import { type ExtractFramesTimestampsInSecondsFn } from './internal-extract-frames';
export type ExtractFramesProps = {
    src: string;
    timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
    onFrame: (frame: VideoFrame) => void;
    signal?: AbortSignal;
    acknowledgeRemotionLicense?: boolean;
    logLevel?: MediaParserLogLevel;
};
export type ExtractFrames = (options: ExtractFramesProps) => Promise<void>;
export declare const extractFrames: ExtractFrames;
