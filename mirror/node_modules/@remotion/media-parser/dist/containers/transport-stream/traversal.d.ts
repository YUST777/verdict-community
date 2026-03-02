import type { TransportStreamStructure } from '../../parse-result';
import type { TransportStreamPMTBox } from './boxes';
import type { TransportStreamProgramAssociationTableEntry } from './parse-pat';
import type { TransportStreamEntry } from './parse-pmt';
export declare const findProgramMapOrNull: (structure: TransportStreamStructure) => TransportStreamPMTBox | null;
export declare const findProgramMapTableOrThrow: (structure: TransportStreamStructure) => TransportStreamPMTBox;
export declare const getProgramForId: (structure: TransportStreamStructure, packetIdentifier: number) => TransportStreamProgramAssociationTableEntry | null;
export declare const getStreamForId: (structure: TransportStreamStructure, packetIdentifier: number) => TransportStreamEntry | null;
