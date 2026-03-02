import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export interface StssBox extends BaseBox {
    type: 'stss-box';
    version: number;
    flags: number[];
    sampleNumber: Set<number>;
}
export declare const parseStss: ({ iterator, offset, boxSize, }: {
    iterator: BufferIterator;
    offset: number;
    boxSize: number;
}) => StssBox;
