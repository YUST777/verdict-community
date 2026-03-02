import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { BaseBox } from './base-type';
import type { ThreeDMatrix } from './moov/mvhd';
export interface TkhdBox extends BaseBox {
    type: 'tkhd-box';
    alternateGroup: number;
    creationTime: number | null;
    duration: number;
    modificationTime: number | null;
    trackId: number;
    version: number;
    layer: number;
    volume: number;
    matrix: ThreeDMatrix;
    width: number;
    height: number;
    unrotatedWidth: number;
    unrotatedHeight: number;
    rotation: number;
}
export declare const parseTkhd: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => TkhdBox;
