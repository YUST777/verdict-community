import type { VideoSample } from 'mediabunny';
type Options = {
    track: {
        width: number;
        height: number;
    };
    container: string;
    durationInSeconds: number | null;
};
export type ExtractFramesTimestampsInSecondsFn = (options: Options) => Promise<number[]> | number[];
export type ExtractFramesProps = {
    src: string;
    timestampsInSeconds: number[] | ExtractFramesTimestampsInSecondsFn;
    onVideoSample: (sample: VideoSample) => void;
    signal?: AbortSignal;
};
export declare function extractFrames({ src, timestampsInSeconds, onVideoSample, signal }: ExtractFramesProps): Promise<void>;
export {};
