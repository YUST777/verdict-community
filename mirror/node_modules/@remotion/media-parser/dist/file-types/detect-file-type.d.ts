import type { MediaParserDimensions } from '../get-dimensions';
import type { BmpType } from './bmp';
import type { JpegType } from './jpeg';
import type { PdfType } from './pdf';
import type { PngType } from './png';
import type { WebpType } from './webp';
export declare const matchesPattern: (pattern: Uint8Array) => (data: Uint8Array) => boolean;
export declare const isRiffAvi: (data: Uint8Array) => boolean;
export declare const isRiffWave: (data: Uint8Array) => boolean;
export declare const isWebm: (data: Uint8Array) => boolean;
export declare const isIsoBaseMedia: (data: Uint8Array) => boolean;
export declare const isTransportStream: (data: Uint8Array) => boolean;
export declare const isMp3: (data: Uint8Array) => boolean;
export declare const isAac: (data: Uint8Array) => boolean;
export declare const isFlac: (data: Uint8Array) => boolean;
export declare const isM3u: (data: Uint8Array) => boolean;
export type RiffType = {
    type: 'riff';
};
export type WebmType = {
    type: 'webm';
};
export type IsoBaseMediaType = {
    type: 'iso-base-media';
};
export type TransportStreamType = {
    type: 'transport-stream';
};
export type Mp3Type = {
    type: 'mp3';
};
export type AacType = {
    type: 'aac';
};
export type WavType = {
    type: 'wav';
};
export type GifType = {
    type: 'gif';
    dimensions: MediaParserDimensions;
};
export type FlacType = {
    type: 'flac';
};
export type M3uType = {
    type: 'm3u';
};
export type UnknownType = {
    type: 'unknown';
};
export type FileType = JpegType | WebpType | RiffType | WebmType | WavType | PdfType | AacType | IsoBaseMediaType | TransportStreamType | Mp3Type | GifType | PngType | BmpType | AacType | FlacType | M3uType | UnknownType;
