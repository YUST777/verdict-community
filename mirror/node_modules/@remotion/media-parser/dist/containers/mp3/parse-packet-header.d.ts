import type { BufferIterator } from '../../iterator/buffer-iterator';
type MpegVersion = 1 | 2;
export declare const parseMp3PacketHeader: (iterator: BufferIterator) => {
    frameLength: number;
    bitrateInKbit: number;
    layer: number;
    mpegVersion: MpegVersion;
    numberOfChannels: number;
    sampleRate: number;
    samplesPerFrame: number;
};
export declare const isMp3PacketHeaderHere: (iterator: BufferIterator) => false | {
    frameLength: number;
    bitrateInKbit: number;
    layer: number;
    mpegVersion: MpegVersion;
    numberOfChannels: number;
    sampleRate: number;
    samplesPerFrame: number;
};
export declare const isMp3PacketHeaderHereAndInNext: (iterator: BufferIterator) => boolean | {
    frameLength: number;
    bitrateInKbit: number;
    layer: number;
    mpegVersion: MpegVersion;
    numberOfChannels: number;
    sampleRate: number;
    samplesPerFrame: number;
};
export {};
