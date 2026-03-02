import type { AudioSampleOffset } from '../../state/audio-sample-map';
import type { Mp3BitrateInfo, Mp3Info, Mp3State } from '../../state/mp3';
import type { ParserState } from '../../state/parser-state';
import type { SamplesObservedState } from '../../state/samples-observed/slow-duration-fps';
import type { MediaSection, MediaSectionState } from '../../state/video-section';
export type Mp3SeekingHints = {
    type: 'mp3-seeking-hints';
    audioSampleMap: AudioSampleOffset[];
    lastSampleObserved: boolean;
    mp3BitrateInfo: Mp3BitrateInfo | null;
    mp3Info: Mp3Info | null;
    mediaSection: MediaSection | null;
    contentLength: number;
};
export declare const getSeekingHintsForMp3: ({ mp3State, samplesObserved, mediaSectionState, contentLength, }: {
    mp3State: Mp3State;
    mediaSectionState: MediaSectionState;
    samplesObserved: SamplesObservedState;
    contentLength: number;
}) => Mp3SeekingHints;
export declare const setSeekingHintsForMp3: ({ hints, state, }: {
    hints: Mp3SeekingHints;
    state: ParserState;
}) => void;
