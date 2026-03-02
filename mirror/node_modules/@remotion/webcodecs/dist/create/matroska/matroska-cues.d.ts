import type { BytesAndOffset } from './matroska-utils';
export type Cue = {
    time: number;
    clusterPosition: number;
    trackNumber: number;
};
export declare const createMatroskaCues: (cues: Cue[]) => BytesAndOffset | null;
