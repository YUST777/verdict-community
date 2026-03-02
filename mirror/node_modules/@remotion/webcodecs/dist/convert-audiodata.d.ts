export type ConvertAudioDataOptions = {
    audioData: AudioData;
    newSampleRate?: number;
    format?: AudioSampleFormat | null;
};
/**
 * Converts an `AudioData` object to a new `AudioData` object with a different sample rate or format.
 * @see [Documentation](https://remotion.dev/docs/webcodecs/convert-audiodata)
 */
export declare const convertAudioData: ({ audioData, newSampleRate, format, }: ConvertAudioDataOptions) => AudioData;
