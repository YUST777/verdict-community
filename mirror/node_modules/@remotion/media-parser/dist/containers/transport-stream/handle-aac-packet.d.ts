import type { MediaParserLogLevel } from '../../log';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { MediaParserOnAudioTrack } from '../../webcodec-sample-types';
import type { TransportStreamPacketBuffer } from './process-stream-buffers';
export declare const handleAacPacket: ({ streamBuffer, programId, offset, sampleCallbacks, logLevel, onAudioTrack, transportStream, makeSamplesStartAtZero, }: {
    streamBuffer: TransportStreamPacketBuffer;
    programId: number;
    offset: number;
    sampleCallbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onAudioTrack: MediaParserOnAudioTrack | null;
    transportStream: TransportStreamState;
    makeSamplesStartAtZero: boolean;
}) => Promise<void>;
