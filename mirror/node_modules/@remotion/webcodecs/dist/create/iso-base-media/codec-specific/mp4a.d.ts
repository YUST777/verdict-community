import type { Mp4aData } from './create-codec-specific-data';
export declare const createMp4a: ({ sampleRate, channelCount, avgBitrate, maxBitrate, codecPrivate, }: Mp4aData) => Uint8Array<ArrayBufferLike>;
