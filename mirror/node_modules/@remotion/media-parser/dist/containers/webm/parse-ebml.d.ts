import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../log';
import type { PossibleEbml } from './segments/all-segments';
import type { WebmRequiredStatesForProcessing } from './state-for-processing';
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export declare const parseEbml: (iterator: BufferIterator, statesForProcessing: WebmRequiredStatesForProcessing | null, logLevel: MediaParserLogLevel) => Promise<Prettify<PossibleEbml> | null>;
export declare const postprocessEbml: ({ offset, ebml, statesForProcessing: { webmState, callbacks, logLevel, onAudioTrack, onVideoTrack, structureState, avcState, }, }: {
    offset: number;
    ebml: Prettify<PossibleEbml>;
    statesForProcessing: WebmRequiredStatesForProcessing;
}) => Promise<Prettify<PossibleEbml>>;
