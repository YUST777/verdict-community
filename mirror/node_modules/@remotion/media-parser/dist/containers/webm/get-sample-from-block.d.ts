import type { MediaParserLogLevel } from '../../log';
import type { AvcState } from '../../state/avc/avc-state';
import type { WebmState } from '../../state/matroska/webm';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { StructureState } from '../../state/structure';
import type { MediaParserAudioSample, MediaParserOnVideoTrack, MediaParserVideoSample } from '../../webcodec-sample-types';
import type { BlockSegment, SimpleBlockSegment } from './segments/all-segments';
type SampleResult = {
    type: 'video-sample';
    videoSample: MediaParserVideoSample;
    trackId: number;
    timescale: number;
} | {
    type: 'audio-sample';
    audioSample: MediaParserAudioSample;
    trackId: number;
    timescale: number;
} | {
    type: 'partial-video-sample';
    partialVideoSample: Omit<MediaParserVideoSample, 'type'>;
    trackId: number;
    timescale: number;
} | {
    type: 'no-sample';
};
export declare const getSampleFromBlock: ({ ebml, webmState, offset, structureState, callbacks, logLevel, onVideoTrack, avcState, }: {
    ebml: BlockSegment | SimpleBlockSegment;
    webmState: WebmState;
    offset: number;
    structureState: StructureState;
    callbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onVideoTrack: MediaParserOnVideoTrack | null;
    avcState: AvcState;
}) => Promise<SampleResult>;
export {};
