import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export interface PaspBox extends BaseBox {
    type: 'pasp-box';
    hSpacing: number;
    vSpacing: number;
}
export declare const parsePasp: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => PaspBox;
