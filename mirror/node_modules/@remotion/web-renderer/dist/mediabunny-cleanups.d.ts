import type { OutputFormat, OutputOptions, Target, VideoEncodingConfig } from 'mediabunny';
import { Output, VideoSampleSource } from 'mediabunny';
export declare const makeOutputWithCleanup: <T extends OutputFormat, U extends Target>(options: OutputOptions<T, U>) => {
    output: Output<T, U>;
    [Symbol.dispose]: () => void;
};
export declare const makeVideoSampleSourceCleanup: (encodingConfig: VideoEncodingConfig) => {
    videoSampleSource: VideoSampleSource;
    [Symbol.dispose]: () => void;
};
