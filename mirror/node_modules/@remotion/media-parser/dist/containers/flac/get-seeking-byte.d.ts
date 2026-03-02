import type { AudioSampleOffset } from '../../state/audio-sample-map';
import type { FlacSeekingHints } from './seeking-hints';
export declare const getSeekingByteForFlac: ({ time, seekingHints, }: {
    time: number;
    seekingHints: FlacSeekingHints;
}) => AudioSampleOffset | null;
