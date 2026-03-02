import type { BufferIterator } from '../../iterator/buffer-iterator';
export interface TfhdBox {
    type: 'tfhd-box';
    version: number;
    trackId: number;
    baseDataOffset: number;
    baseSampleDescriptionIndex: number;
    defaultSampleDuration: number;
    defaultSampleSize: number;
    defaultSampleFlags: number;
}
export declare const getTfhd: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => TfhdBox;
