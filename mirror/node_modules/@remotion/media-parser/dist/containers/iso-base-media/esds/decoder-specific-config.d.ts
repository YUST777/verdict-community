import type { BufferIterator } from '../../../iterator/buffer-iterator';
type UnknownDecoderSpecificConfig = {
    type: 'unknown-decoder-specific-config';
};
type AudioSpecificConfig = {
    type: 'mp4a-specific-config';
    audioObjectType: number;
    samplingFrequencyIndex: number;
    channelConfiguration: number;
    asBytes: Uint8Array;
};
export type DecoderSpecificConfig = UnknownDecoderSpecificConfig | AudioSpecificConfig;
export declare const parseDecoderSpecificConfig: (iterator: BufferIterator) => DecoderSpecificConfig;
export {};
