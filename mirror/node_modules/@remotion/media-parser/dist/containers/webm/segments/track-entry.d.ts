import type { TrackEntry } from './all-segments';
export type TrackInfo = {
    codec: string;
    trackTimescale: number | null;
};
type TrackType = 'video' | 'audio' | 'complex' | 'subtitle' | 'button' | 'control' | 'metadata';
export declare const trackTypeToString: (trackType: number) => TrackType;
export type GetTracks = () => TrackEntry[];
export {};
