import type { AvcState } from '../../state/avc/avc-state';
import type { RiffState } from '../../state/riff';
import type { SeekResolution } from '../../work-on-seek-request';
import type { RiffSeekingHints } from './seeking-hints';
export declare const getSeekingByteForRiff: ({ info, time, riffState, avcState, }: {
    info: RiffSeekingHints;
    time: number;
    riffState: RiffState;
    avcState: AvcState;
}) => Promise<SeekResolution>;
