import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { BaseBox } from './base-type';
export interface FtypBox extends BaseBox {
    type: 'ftyp-box';
    majorBrand: string;
    minorVersion: number;
    compatibleBrands: string[];
}
export declare const parseFtyp: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => FtypBox;
