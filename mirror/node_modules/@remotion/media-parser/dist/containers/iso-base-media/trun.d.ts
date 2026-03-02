import type { BufferIterator } from '../../iterator/buffer-iterator';
export interface TrunBox {
    type: 'trun-box';
    version: number;
    sampleCount: number;
    dataOffset: number | null;
    firstSampleFlags: number | null;
    samples: TRunSample[];
}
type TRunSample = {
    sampleDuration: number | null;
    sampleSize: number | null;
    sampleFlags: number | null;
    sampleCompositionTimeOffset: number | null;
};
export declare const parseTrun: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => TrunBox;
export {};
