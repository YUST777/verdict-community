import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { RiffBox } from './riff-box';
export declare const parseStrh: ({ iterator, size, }: {
    iterator: BufferIterator;
    size: number;
}) => RiffBox;
