import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { TransportStreamStructure } from '../../parse-result';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { TransportStreamBox } from './boxes';
export declare const parsePacket: ({ iterator, structure, transportStream, }: {
    iterator: BufferIterator;
    structure: TransportStreamStructure;
    transportStream: TransportStreamState;
}) => TransportStreamBox | null;
