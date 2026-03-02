import type { SamplePosition } from '@remotion/media-parser';
import type { MakeTrackAudio, MakeTrackVideo } from '../make-track-info';
export type IsoBaseMediaTrackData = {
    track: MakeTrackVideo | MakeTrackAudio;
    durationInUnits: number;
    samplePositions: SamplePosition[];
    timescale: number;
};
export declare const serializeTrack: ({ track, durationInUnits, samplePositions, timescale, }: IsoBaseMediaTrackData) => Uint8Array<ArrayBufferLike>;
