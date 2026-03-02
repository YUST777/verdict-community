import type { SeekResolution } from '../../work-on-seek-request';
import type { AacSeekingHints } from './seeking-hints';
export declare const getSeekingByteForAac: ({ time, seekingHints, }: {
    time: number;
    seekingHints: AacSeekingHints;
}) => SeekResolution;
