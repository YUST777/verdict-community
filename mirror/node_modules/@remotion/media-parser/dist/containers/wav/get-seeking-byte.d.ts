import type { WavSeekingHints } from '../../seeking-hints';
import type { SeekResolution } from '../../work-on-seek-request';
export declare const WAVE_SAMPLES_PER_SECOND = 25;
export declare const getSeekingByteFromWav: ({ info, time, }: {
    info: WavSeekingHints;
    time: number;
}) => Promise<SeekResolution>;
