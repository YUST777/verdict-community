import type { MediaParserAudioTrack, MediaParserVideoTrack } from '../../../get-tracks';
import type { IsoBaseMediaBox } from '../base-media-box';
export declare const findBestSegmentFromTfra: ({ mfra, time, firstTrack, timescale, }: {
    mfra: IsoBaseMediaBox[];
    time: number;
    firstTrack: MediaParserVideoTrack | MediaParserAudioTrack;
    timescale: number;
}) => {
    start: number;
    end: number;
} | null;
