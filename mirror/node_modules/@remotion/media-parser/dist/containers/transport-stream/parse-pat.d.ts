import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { TransportStreamPATBox, TransportStreamSdtBox } from './boxes';
export type TransportStreamProgramAssociationTableEntry = {
    type: 'transport-stream-program-association-table';
    programNumber: number;
    programMapIdentifier: number;
};
export declare const parsePat: (iterator: BufferIterator) => TransportStreamPATBox;
export declare const parseSdt: (iterator: BufferIterator) => TransportStreamSdtBox;
