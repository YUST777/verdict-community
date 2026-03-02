import type { BufferIterator } from '../../../iterator/buffer-iterator';
export interface AvccBox {
    type: 'avcc-box';
    privateData: Uint8Array;
    configurationString: string;
}
export declare const parseAvcc: ({ data, size, }: {
    data: BufferIterator;
    size: number;
}) => AvccBox;
