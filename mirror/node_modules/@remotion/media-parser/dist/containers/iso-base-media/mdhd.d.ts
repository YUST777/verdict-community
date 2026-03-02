import type { BufferIterator } from '../../iterator/buffer-iterator';
export interface MdhdBox {
    type: 'mdhd-box';
    version: number;
    timescale: number;
    duration: number;
    language: number;
    quality: number;
    creationTime: number | null;
    modificationTime: number | null;
}
export declare const parseMdhd: ({ data, size, fileOffset, }: {
    data: BufferIterator;
    size: number;
    fileOffset: number;
}) => MdhdBox;
