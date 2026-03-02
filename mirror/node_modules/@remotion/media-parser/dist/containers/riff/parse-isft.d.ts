import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { IsftBox } from './riff-box';
export declare const parseIsft: ({ iterator, size, }: {
    iterator: BufferIterator;
    size: number;
}) => IsftBox;
