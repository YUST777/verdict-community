import type { BufferIterator } from '../../../iterator/buffer-iterator';
export interface Av1CBox {
    type: 'av1C-box';
    privateData: Uint8Array;
}
export declare const parseAv1C: ({ data, size, }: {
    data: BufferIterator;
    size: number;
}) => Av1CBox;
