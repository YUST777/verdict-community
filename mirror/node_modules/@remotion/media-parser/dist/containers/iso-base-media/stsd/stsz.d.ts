import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
type Discriminated = {
    countType: 'fixed';
    sampleSize: number;
} | {
    countType: 'variable';
    entries: number[];
};
export type StszBox = BaseBox & {
    type: 'stsz-box';
    version: number;
    flags: number[];
    sampleCount: number;
} & Discriminated;
export declare const parseStsz: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => StszBox;
export {};
