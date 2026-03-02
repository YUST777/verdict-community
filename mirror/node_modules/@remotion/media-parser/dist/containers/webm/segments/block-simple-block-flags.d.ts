import type { BufferIterator } from '../../../iterator/buffer-iterator';
import { matroskaElements } from './all-segments';
type BlockFlags = {
    invisible: boolean;
    lacing: number;
    keyframe: boolean | null;
};
export declare const parseBlockFlags: (iterator: BufferIterator, type: (typeof matroskaElements)["Block"] | (typeof matroskaElements)["SimpleBlock"]) => BlockFlags;
export {};
