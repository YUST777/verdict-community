import type { MediaParserLogLevel } from '../../log';
import type { AvcState } from '../../state/avc/avc-state';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { MediaParserOnVideoTrack } from '../../webcodec-sample-types';
import type { TransportStreamPacketBuffer } from './process-stream-buffers';
export declare const MPEG_TIMESCALE = 90000;
export declare const handleAvcPacket: ({ streamBuffer, programId, offset, sampleCallbacks, logLevel, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }: {
    streamBuffer: TransportStreamPacketBuffer;
    programId: number;
    offset: number;
    sampleCallbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onVideoTrack: MediaParserOnVideoTrack | null;
    transportStream: TransportStreamState;
    makeSamplesStartAtZero: boolean;
    avcState: AvcState;
}) => Promise<void>;
