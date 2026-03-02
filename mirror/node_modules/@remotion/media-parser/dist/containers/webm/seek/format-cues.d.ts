import type { PossibleEbml } from '../segments/all-segments';
export type MatroskaCue = {
    trackId: number;
    timeInTimescale: number;
    clusterPositionInSegment: number;
    relativePosition: number;
};
export declare const formatCues: (cues: PossibleEbml[]) => MatroskaCue[];
