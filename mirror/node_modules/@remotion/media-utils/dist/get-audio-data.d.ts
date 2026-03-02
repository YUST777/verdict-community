import type { MediaUtilsAudioData } from './types';
type Options = {
    sampleRate?: number;
};
export declare const getAudioData: (src: string, options?: Options | undefined) => Promise<MediaUtilsAudioData>;
export {};
