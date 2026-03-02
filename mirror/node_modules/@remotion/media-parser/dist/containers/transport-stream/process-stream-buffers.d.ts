import type { MediaParserLogLevel } from '../../log';
import type { TransportStreamStructure } from '../../parse-result';
import type { AvcState } from '../../state/avc/avc-state';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { MediaParserOnAudioTrack, MediaParserOnVideoTrack } from '../../webcodec-sample-types';
import type { PacketPes } from './parse-pes';
export type TransportStreamPacketBuffer = {
    pesHeader: PacketPes;
    offset: number;
    getBuffer: () => Uint8Array;
    addBuffer: (buffer: Uint8Array) => void;
    get2ndSubArrayIndex: () => number;
};
export declare const makeTransportStreamPacketBuffer: ({ buffers, pesHeader, offset, }: {
    buffers: Uint8Array | null;
    pesHeader: PacketPes;
    offset: number;
}) => TransportStreamPacketBuffer;
export type StreamBufferMap = Map<number, TransportStreamPacketBuffer>;
export declare const processStreamBuffer: ({ streamBuffer, programId, structure, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }: {
    streamBuffer: TransportStreamPacketBuffer;
    programId: number;
    structure: TransportStreamStructure;
    sampleCallbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onAudioTrack: MediaParserOnAudioTrack | null;
    onVideoTrack: MediaParserOnVideoTrack | null;
    transportStream: TransportStreamState;
    makeSamplesStartAtZero: boolean;
    avcState: AvcState;
}) => Promise<void>;
export declare const processFinalStreamBuffers: ({ structure, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }: {
    structure: TransportStreamStructure;
    sampleCallbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onAudioTrack: MediaParserOnAudioTrack | null;
    onVideoTrack: MediaParserOnVideoTrack | null;
    transportStream: TransportStreamState;
    makeSamplesStartAtZero: boolean;
    avcState: AvcState;
}) => Promise<void>;
