import type { MediaParserVideoSample } from '../../webcodec-sample-types';
export type QueuedVideoSample = Omit<MediaParserVideoSample, 'decodingTimestamp' | 'timestamp'>;
type QueueItem = {
    sample: QueuedVideoSample;
    trackId: number;
    timescale: number;
};
export declare const queuedBFramesState: () => {
    addFrame: ({ frame, maxFramesInBuffer, trackId, timescale, }: {
        frame: QueuedVideoSample;
        trackId: number;
        maxFramesInBuffer: number;
        timescale: number;
    }) => void;
    flush: () => void;
    getReleasedFrame: () => QueueItem | null;
    hasReleasedFrames: () => boolean;
    clear: () => void;
};
export {};
