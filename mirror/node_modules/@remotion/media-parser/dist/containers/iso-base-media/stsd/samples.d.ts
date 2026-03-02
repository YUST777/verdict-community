import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../../log';
import type { AnySegment } from '../../../parse-result';
import type { IsoBaseMediaBox } from '../base-media-box';
type SampleBase = {
    format: string;
    offset: number;
    dataReferenceIndex: number;
    size: number;
};
export type AudioSample = SampleBase & {
    type: 'audio';
    numberOfChannels: number;
    sampleSize: number;
    compressionId: number;
    packetSize: number;
    sampleRate: number;
    samplesPerPacket: number | null;
    bytesPerPacket: number | null;
    bytesPerFrame: number | null;
    bitsPerSample: number | null;
    children: AnySegment[];
    version: number;
    revisionLevel: number;
    vendor: number[];
};
export type VideoSample = SampleBase & {
    type: 'video';
    temporalQuality: number;
    spacialQuality: number;
    width: number;
    height: number;
    compressorName: number[];
    horizontalResolutionPpi: number;
    verticalResolutionPpi: number;
    dataSize: number;
    frameCountPerSample: number;
    depth: number;
    colorTableId: number;
    descriptors: IsoBaseMediaBox[];
    version: number;
    revisionLevel: number;
    vendor: number[];
};
type UnknownSample = SampleBase & {
    type: 'unknown';
};
export type Sample = AudioSample | VideoSample | UnknownSample;
type FormatBoxAndNext = {
    sample: Sample | null;
};
export declare const processIsoFormatBox: ({ iterator, logLevel, contentLength, }: {
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    contentLength: number;
}) => Promise<FormatBoxAndNext>;
export declare const parseIsoFormatBoxes: ({ maxBytes, logLevel, iterator, contentLength, }: {
    maxBytes: number;
    logLevel: MediaParserLogLevel;
    iterator: BufferIterator;
    contentLength: number;
}) => Promise<Sample[]>;
export {};
