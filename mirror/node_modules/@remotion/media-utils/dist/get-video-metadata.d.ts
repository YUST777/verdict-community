import type { VideoMetadata } from './types';
/**
 * @description Takes a src to a video, loads it and returns metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-video-metadata)
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/miscellaneous/parse-media-vs-get-video-metadata
 */
export declare const getVideoMetadata: (src: string) => Promise<VideoMetadata>;
