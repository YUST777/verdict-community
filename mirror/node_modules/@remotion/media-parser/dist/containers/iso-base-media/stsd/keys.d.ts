import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { BaseBox } from '../base-type';
type KeysEntry = {
    keySize: number;
    namespace: string;
    value: string;
};
export interface KeysBox extends BaseBox {
    type: 'keys-box';
    version: number;
    entryCount: number;
    entries: KeysEntry[];
}
export declare const parseKeys: ({ iterator, offset, size, }: {
    iterator: BufferIterator;
    offset: number;
    size: number;
}) => KeysBox;
export {};
