import type { VideoMetadata } from './compositor/payloads';
export { VideoMetadata } from './compositor/payloads';
/**
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/media-parser/parse-media
 */
export declare const getVideoMetadata: (videoSource: string, options?: {
    logLevel?: "error" | "info" | "trace" | "verbose" | "warn" | undefined;
    binariesDirectory?: string | null | undefined;
} | undefined) => Promise<VideoMetadata>;
