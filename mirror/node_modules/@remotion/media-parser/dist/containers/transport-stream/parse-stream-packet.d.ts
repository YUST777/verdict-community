import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { TransportStreamEntry } from './parse-pmt';
export declare const parseStream: ({ transportStreamEntry, programId, iterator, transportStream, }: {
    transportStreamEntry: TransportStreamEntry;
    programId: number;
    iterator: BufferIterator;
    transportStream: TransportStreamState;
}) => void;
