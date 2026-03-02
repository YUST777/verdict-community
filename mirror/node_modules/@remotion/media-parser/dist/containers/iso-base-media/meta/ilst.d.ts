import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
type IlstEntry = {
    index: string;
    wellKnownType: number;
    type: string;
    value: Value;
};
export type Value = {
    type: 'text';
    value: string;
} | {
    type: 'number';
    value: number;
} | {
    type: 'unknown';
    value: unknown;
};
export interface IlstBox extends BaseBox {
    type: 'ilst-box';
    entries: IlstEntry[];
}
export declare const parseIlstBox: ({ iterator, size, offset, }: {
    iterator: BufferIterator;
    size: number;
    offset: number;
}) => IlstBox;
export {};
