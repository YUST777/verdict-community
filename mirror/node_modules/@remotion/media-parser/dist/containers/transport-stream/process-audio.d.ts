import type { MediaParserLogLevel } from '../../log';
import type { TransportStreamStructure } from '../../parse-result';
import type { AvcState } from '../../state/avc/avc-state';
import type { CallbacksState } from '../../state/sample-callbacks';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
import type { MediaParserOnAudioTrack, MediaParserOnVideoTrack } from '../../webcodec-sample-types';
import type { TransportStreamEntry } from './parse-pmt';
import type { TransportStreamPacketBuffer } from './process-stream-buffers';
export declare const canProcessAudio: ({ streamBuffer, }: {
    streamBuffer: TransportStreamPacketBuffer;
}) => boolean;
export declare const processAudio: ({ transportStreamEntry, structure, offset, sampleCallbacks, logLevel, onAudioTrack, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }: {
    transportStreamEntry: TransportStreamEntry;
    structure: TransportStreamStructure;
    sampleCallbacks: CallbacksState;
    logLevel: MediaParserLogLevel;
    onAudioTrack: MediaParserOnAudioTrack | null;
    onVideoTrack: MediaParserOnVideoTrack | null;
    transportStream: TransportStreamState;
    offset: number;
    makeSamplesStartAtZero: boolean;
    avcState: AvcState;
}) => Promise<void>;
