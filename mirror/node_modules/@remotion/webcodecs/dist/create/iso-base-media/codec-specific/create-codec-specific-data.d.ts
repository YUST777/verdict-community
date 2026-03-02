import type { MakeTrackAudio, MakeTrackVideo } from '../../make-track-info';
export type Avc1Data = {
    pasp: Uint8Array;
    avccBox: Uint8Array;
    width: number;
    height: number;
    horizontalResolution: number;
    verticalResolution: number;
    compressorName: string;
    depth: number;
    type: 'avc1-data';
};
export type Hvc1Data = {
    pasp: Uint8Array;
    hvccBox: Uint8Array;
    width: number;
    height: number;
    horizontalResolution: number;
    verticalResolution: number;
    compressorName: string;
    depth: number;
    type: 'hvc1-data';
};
export type Mp4aData = {
    type: 'mp4a-data';
    sampleRate: number;
    channelCount: number;
    maxBitrate: number;
    avgBitrate: number;
    codecPrivate: Uint8Array | null;
};
export type CodecSpecificData = Avc1Data | Mp4aData;
export declare const createCodecSpecificData: (track: MakeTrackAudio | MakeTrackVideo) => Uint8Array<ArrayBufferLike>;
