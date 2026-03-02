import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
type CttsEntry = {
    sampleCount: number;
    sampleOffset: number;
};
export interface CttsBox extends BaseBox {
    type: 'ctts-box';
    version: number;
    flags: number[];
    entryCount: number;
    entries: CttsEntry[];
}
export declare const parseCtts: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => CttsBox;
export {};
