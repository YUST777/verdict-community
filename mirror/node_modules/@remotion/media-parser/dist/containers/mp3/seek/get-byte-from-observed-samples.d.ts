import type { AudioSampleOffset } from '../../../state/audio-sample-map';
import type { Mp3SeekingHints } from '../seeking-hints';
export declare const getByteFromObservedSamples: ({ info, timeInSeconds, }: {
    info: Mp3SeekingHints;
    timeInSeconds: number;
}) => AudioSampleOffset | undefined;
