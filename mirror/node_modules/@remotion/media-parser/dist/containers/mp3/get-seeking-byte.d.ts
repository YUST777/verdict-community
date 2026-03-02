import type { SeekResolution } from '../../work-on-seek-request';
import type { Mp3SeekingHints } from './seeking-hints';
export declare const getSeekingByteForMp3: ({ time, info, }: {
    time: number;
    info: Mp3SeekingHints;
}) => SeekResolution;
