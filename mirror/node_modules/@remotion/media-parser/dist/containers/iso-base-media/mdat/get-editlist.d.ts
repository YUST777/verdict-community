import type { TrakBox } from '../trak/trak';
export declare const findTrackStartTimeInSeconds: ({ movieTimeScale, trakBox, }: {
    movieTimeScale: number;
    trakBox: TrakBox;
}) => number;
export declare const findTrackMediaTimeOffsetInTrackTimescale: ({ trakBox, }: {
    trakBox: TrakBox;
}) => number;
