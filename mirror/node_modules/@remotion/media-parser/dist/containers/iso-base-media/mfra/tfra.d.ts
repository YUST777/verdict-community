import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
export type TfraEntry = {
    time: number;
    moofOffset: number;
    trafNumber: number;
    trunNumber: number;
    sampleNumber: number;
};
export interface TfraBox extends BaseBox {
    type: 'tfra-box';
    trackId: number;
    entries: TfraEntry[];
}
export declare const parseTfraBox: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => TfraBox;
