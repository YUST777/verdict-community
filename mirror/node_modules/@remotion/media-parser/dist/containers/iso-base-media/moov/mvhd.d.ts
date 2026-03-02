import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export type ThreeDMatrix = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export interface MvhdBox extends BaseBox {
    durationInUnits: number;
    durationInSeconds: number;
    creationTime: number | null;
    modificationTime: number | null;
    timeScale: number;
    rate: number;
    volume: number;
    matrix: ThreeDMatrix;
    nextTrackId: number;
    type: 'mvhd-box';
}
export declare const parseMvhd: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => MvhdBox;
