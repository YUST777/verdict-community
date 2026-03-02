import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export interface StcoBox extends BaseBox {
    type: 'stco-box';
    version: number;
    flags: number[];
    entryCount: number;
    entries: (number | bigint)[];
}
export declare const parseStco: ({ iterator, offset, size, mode64Bit, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
    mode64Bit: boolean;
}) => StcoBox;
