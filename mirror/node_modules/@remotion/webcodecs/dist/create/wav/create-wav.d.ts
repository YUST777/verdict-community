import type { MediaFn, MediaFnGeneratorInput } from '../media-fn';
export declare const createWav: ({ filename, logLevel, onBytesProgress, onMillisecondsProgress, writer, progressTracker, }: MediaFnGeneratorInput) => Promise<MediaFn>;
