import type { MediaFn, MediaFnGeneratorInput } from '../media-fn';
export declare const createIsoBaseMedia: ({ writer, onBytesProgress, onMillisecondsProgress, logLevel, filename, progressTracker, expectedDurationInSeconds, expectedFrameRate, }: MediaFnGeneratorInput) => Promise<MediaFn>;
