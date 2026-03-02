import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { RiffBox } from './riff-box';
export declare const parseIdx1: ({ iterator, size, }: {
    iterator: BufferIterator;
    size: number;
}) => RiffBox;
