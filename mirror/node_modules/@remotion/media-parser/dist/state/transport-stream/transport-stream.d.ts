import type { TransportStreamPacketBuffer } from '../../containers/transport-stream/process-stream-buffers';
export declare const transportStreamState: () => {
    nextPesHeaderStore: {
        setNextPesHeader: (pesHeader: import("../../containers/transport-stream/parse-pes").PacketPes) => void;
        getNextPesHeader: () => import("../../containers/transport-stream/parse-pes").PacketPes;
    };
    observedPesHeaders: {
        pesHeaders: import("../../containers/transport-stream/parse-pes").PacketPes[];
        addPesHeader: (pesHeader: import("../../containers/transport-stream/parse-pes").PacketPes) => void;
        markPtsAsKeyframe: (pts: number) => void;
        getPesKeyframeHeaders: () => import("../../containers/transport-stream/parse-pes").PacketPes[];
        setPesKeyframesFromSeekingHints: (hints: import("../../seeking-hints").TransportStreamSeekingHints) => void;
    };
    streamBuffers: Map<number, TransportStreamPacketBuffer>;
    startOffset: {
        getOffset: (trackId: number) => number;
        setOffset: ({ newOffset, trackId }: {
            trackId: number;
            newOffset: number;
        }) => void;
    };
    resetBeforeSeek: () => void;
    lastEmittedSample: {
        setLastEmittedSample: (sample: import("../..").MediaParserAudioSample | import("../..").MediaParserVideoSample) => void;
        getLastEmittedSample: () => import("../..").MediaParserVideoSample | import("../..").MediaParserAudioSample | null;
        resetLastEmittedSample: () => void;
    };
};
export type TransportStreamState = ReturnType<typeof transportStreamState>;
