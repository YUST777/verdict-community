import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { DecoderSpecificConfig } from './decoder-specific-config';
type AudioObjectType = 'aac' | 'mp3' | 'unknown';
type DecoderConfigDescriptor = {
    type: 'decoder-config-descriptor';
    objectTypeIndication: AudioObjectType;
    asNumber: number;
    streamType: number;
    upStream: number;
    bufferSizeDB: number;
    maxBitrate: number;
    avgBitrate: number;
    decoderSpecificConfigs: DecoderSpecificConfig[];
};
type SlConfigDescriptor = {
    type: 'sl-config-descriptor';
};
type UnknownDescriptor = {
    type: 'unknown-descriptor';
};
export type Descriptor = DecoderConfigDescriptor | SlConfigDescriptor | UnknownDescriptor;
type DescriptorAndNext = {
    descriptor: Descriptor | null;
};
export declare const processDescriptor: ({ iterator, }: {
    iterator: BufferIterator;
}) => DescriptorAndNext;
export declare const parseDescriptors: (iterator: BufferIterator, maxBytes: number) => Descriptor[];
export {};
