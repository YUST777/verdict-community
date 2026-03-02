import type { MediaFn, MediaFnGeneratorInput } from '../media-fn';
export declare const createMatroskaMedia: ({ writer, onBytesProgress, onMillisecondsProgress, filename, logLevel, progressTracker, }: MediaFnGeneratorInput) => Promise<MediaFn>;
