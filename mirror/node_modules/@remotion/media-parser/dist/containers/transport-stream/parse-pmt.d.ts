import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { TransportStreamPMTBox } from './boxes';
export type TransportStreamEntry = {
    streamType: number;
    pid: number;
};
export type TransportStreamProgramMapTable = {
    type: 'transport-stream-program-map-table';
    streams: TransportStreamEntry[];
};
export declare const parsePmt: (iterator: BufferIterator) => TransportStreamPMTBox;
