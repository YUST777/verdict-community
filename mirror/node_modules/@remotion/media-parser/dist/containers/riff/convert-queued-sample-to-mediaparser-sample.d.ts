import type { ParserState } from '../../state/parser-state';
import type { QueuedVideoSample } from '../../state/riff/queued-frames';
export declare const convertQueuedSampleToMediaParserSample: ({ sample, state, trackId, }: {
    sample: QueuedVideoSample;
    state: ParserState;
    trackId: number;
}) => {
    timestamp: number;
    decodingTimestamp: number;
    type: "key" | "delta";
    data: Uint8Array;
    duration: number | undefined;
    offset: number;
    avc?: import("../../webcodec-sample-types").MediaParserAvcExtraInfo | undefined;
};
