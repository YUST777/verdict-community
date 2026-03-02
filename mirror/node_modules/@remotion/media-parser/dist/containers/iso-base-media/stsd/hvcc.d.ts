import type { BufferIterator } from '../../../iterator/buffer-iterator';
export interface HvccBox {
    type: 'hvcc-box';
    privateData: Uint8Array;
    configurationString: string;
}
export declare const parseHvcc: ({ data, size, offset, }: {
    data: BufferIterator;
    size: number;
    offset: number;
}) => HvccBox;
