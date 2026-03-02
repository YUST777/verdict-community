import type { BufferIterator } from '../../iterator/buffer-iterator';
export declare const getBlockSize: (iterator: BufferIterator) => number | "uncommon-u16" | "uncommon-u8" | null;
