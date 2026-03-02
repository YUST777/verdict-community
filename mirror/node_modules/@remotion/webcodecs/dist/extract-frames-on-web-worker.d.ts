import { type MediaParserLogLevel } from '@remotion/media-parser';
import { type ExtractFramesTimestampsInSecondsFn } from './internal-extract-frames';
export type ExtractFramesOnWebWorkerProps = {
    src: string;
    timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
    onFrame: (frame: VideoFrame) => void;
    signal?: AbortSignal;
    acknowledgeRemotionLicense?: boolean;
    logLevel?: MediaParserLogLevel;
};
export type ExtractFramesOnWebWorker = (options: ExtractFramesOnWebWorkerProps) => Promise<void>;
export declare const extractFramesOnWebWorker: ExtractFramesOnWebWorker;
