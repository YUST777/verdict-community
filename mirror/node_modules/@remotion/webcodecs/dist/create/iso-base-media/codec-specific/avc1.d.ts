import type { Avc1Data } from './create-codec-specific-data';
export declare const createAvc1Data: ({ avccBox, pasp, width, height, horizontalResolution, verticalResolution, compressorName, depth, }: Avc1Data) => Uint8Array<ArrayBufferLike>;
