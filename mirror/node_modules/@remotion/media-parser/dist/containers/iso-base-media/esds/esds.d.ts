import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { Descriptor } from './esds-descriptors';
export interface EsdsBox {
    type: 'esds-box';
    version: number;
    tag: number;
    sizeOfInstance: number;
    esId: number;
    descriptors: Descriptor[];
}
export declare const parseEsds: ({ data, size, fileOffset, }: {
    data: BufferIterator;
    size: number;
    fileOffset: number;
}) => EsdsBox;
