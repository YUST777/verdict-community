import type { AssetVolume } from './types';
type FfmpegEval = 'once' | 'frame';
type FfmpegVolumeExpression = {
    eval: FfmpegEval;
    value: string;
};
export declare const ffmpegVolumeExpression: ({ volume, fps, trimLeft, }: {
    volume: AssetVolume;
    trimLeft: number;
    fps: number;
}) => FfmpegVolumeExpression;
export {};
