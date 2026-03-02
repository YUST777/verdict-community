import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { BaseBox } from './base-type';
export interface ElstBox extends BaseBox {
    type: 'elst-box';
    version: number;
    flags: number;
    entries: ElstEntry[];
}
export type ElstEntry = {
    editDuration: number;
    mediaTime: number;
    mediaRateInteger: number;
    mediaRateFraction: number;
};
export declare const parseElst: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => ElstBox;
