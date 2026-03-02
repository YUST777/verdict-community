import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../log';
import type { SegmentSection } from '../../state/matroska/webm';
import type { MediaSectionState } from '../../state/video-section';
import { type PossibleEbml, type TrackEntry } from './segments/all-segments';
import { type WebmRequiredStatesForProcessing } from './state-for-processing';
export type MatroskaSegment = PossibleEbml;
export type OnTrackEntrySegment = (trackEntry: TrackEntry) => void;
export declare const expectSegment: ({ statesForProcessing, isInsideSegment, iterator, logLevel, mediaSectionState, }: {
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    statesForProcessing: WebmRequiredStatesForProcessing | null;
    isInsideSegment: SegmentSection | null;
    mediaSectionState: MediaSectionState | null;
}) => Promise<MatroskaSegment | null>;
