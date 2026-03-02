import type { BufferIterator } from '../../iterator/buffer-iterator';
export interface TfdtBox {
    type: 'tfdt-box';
    version: number;
    baseMediaDecodeTime: number;
    offset: number;
}
export declare const parseTfdt: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => TfdtBox;
