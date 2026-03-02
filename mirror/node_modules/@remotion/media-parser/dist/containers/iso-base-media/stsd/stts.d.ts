import type { BufferIterator } from '../../../iterator/buffer-iterator';
export interface SttsBox {
    type: 'stts-box';
    sampleDistribution: SampleDistribution[];
}
type SampleDistribution = {
    sampleCount: number;
    sampleDelta: number;
};
export declare const parseStts: ({ data, size, fileOffset, }: {
    data: BufferIterator;
    size: number;
    fileOffset: number;
}) => SttsBox;
export {};
