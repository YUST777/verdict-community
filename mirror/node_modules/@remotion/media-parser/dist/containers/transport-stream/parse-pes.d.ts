import type { BufferIterator } from '../../iterator/buffer-iterator';
export type PacketPes = {
    streamId: number;
    dts: number | null;
    pts: number;
    priority: number;
    offset: number;
};
export declare const parsePes: ({ iterator, offset, }: {
    iterator: BufferIterator;
    offset: number;
}) => PacketPes;
