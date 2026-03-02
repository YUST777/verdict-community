import type { PacketPes } from '../../containers/transport-stream/parse-pes';
import type { TransportStreamSeekingHints } from '../../seeking-hints';
export declare const makeObservedPesHeader: () => {
    pesHeaders: PacketPes[];
    addPesHeader: (pesHeader: PacketPes) => void;
    markPtsAsKeyframe: (pts: number) => void;
    getPesKeyframeHeaders: () => PacketPes[];
    setPesKeyframesFromSeekingHints: (hints: TransportStreamSeekingHints) => void;
};
export type ObservedPesHeaderState = ReturnType<typeof makeObservedPesHeader>;
export declare const getLastKeyFrameBeforeTimeInSeconds: ({ observedPesHeaders, timeInSeconds, ptsStartOffset, }: {
    observedPesHeaders: ObservedPesHeaderState["pesHeaders"];
    timeInSeconds: number;
    ptsStartOffset: number;
}) => PacketPes | undefined;
