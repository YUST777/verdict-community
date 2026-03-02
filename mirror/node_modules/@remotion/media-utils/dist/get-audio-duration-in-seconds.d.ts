/**
 * @description Gets the duration in seconds of an audio source by creating an invisible `<audio>` tag, loading the audio, and returning the duration.
 * @see [Documentation](https://remotion.dev/docs/get-audio-duration-in-seconds)
 * @deprecated Use `parseMedia()` instead: https://www.remotion.dev/docs/media-parser/parse-media
 */
export declare const getAudioDurationInSeconds: (src: string) => Promise<number>;
/**
 * @deprecated Renamed to `getAudioDurationInSeconds`
 */
export declare const getAudioDuration: (src: string) => Promise<number>;
