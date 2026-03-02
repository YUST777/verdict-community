import type { BufferIterator } from '../../iterator/buffer-iterator';
export declare const discardRestOfPacket: (iterator: BufferIterator) => void;
export declare const getRestOfPacket: (iterator: BufferIterator) => Uint8Array<ArrayBuffer>;
