import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export interface StscBox extends BaseBox {
    type: 'stsc-box';
    version: number;
    flags: number[];
    entryCount: number;
    entries: Map<number, number>;
}
export declare const parseStsc: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => StscBox;
