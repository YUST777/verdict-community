import type { TrakBox } from './trak/trak';
type ShouldGroup = {
    bigEndian: boolean;
};
export declare const shouldGroupAudioSamples: (trakBox: TrakBox) => ShouldGroup | null;
export {};
