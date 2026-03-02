import type { PacketPes } from '../../containers/transport-stream/parse-pes';
export declare const makeNextPesHeaderStore: () => {
    setNextPesHeader: (pesHeader: PacketPes) => void;
    getNextPesHeader: () => PacketPes;
};
export type NextPesHeaderStore = ReturnType<typeof makeNextPesHeaderStore>;
