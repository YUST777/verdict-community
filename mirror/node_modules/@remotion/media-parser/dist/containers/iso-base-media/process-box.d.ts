import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../log';
import type { FetchMoreData } from '../../skip';
import type { TracksState } from '../../state/has-tracks-section';
import type { IsoBaseMediaState } from '../../state/iso-base-media/iso-state';
import type { MovieTimeScaleState } from '../../state/iso-base-media/timescale-state';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { MediaSectionState } from '../../state/video-section';
import type { MediaParserOnAudioTrack, MediaParserOnVideoTrack } from '../../webcodec-sample-types';
import type { IsoBaseMediaBox } from './base-media-box';
export type OnlyIfMoovAtomExpected = {
    tracks: TracksState;
    isoState: IsoBaseMediaState | null;
    movieTimeScaleState: MovieTimeScaleState;
    onVideoTrack: MediaParserOnVideoTrack | null;
    onAudioTrack: MediaParserOnAudioTrack | null;
    registerVideoSampleCallback: CallbacksState['registerVideoSampleCallback'];
    registerAudioSampleCallback: CallbacksState['registerAudioSampleCallback'];
};
export type OnlyIfMdatAtomExpected = {
    mediaSectionState: MediaSectionState;
};
type ProcessBoxResult = {
    type: 'box';
    box: IsoBaseMediaBox;
} | {
    type: 'nothing';
} | {
    type: 'fetch-more-data';
    bytesNeeded: FetchMoreData;
};
export declare const processBox: ({ iterator, logLevel, onlyIfMoovAtomExpected, onlyIfMdatAtomExpected, contentLength, }: {
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected | null;
    onlyIfMdatAtomExpected: OnlyIfMdatAtomExpected | null;
    contentLength: number;
}) => Promise<ProcessBoxResult>;
export {};
