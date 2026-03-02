import { type BufferIterator } from '../../iterator/buffer-iterator';
import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare const parseFrameHeader: ({ iterator, state, }: {
    iterator: BufferIterator;
    state: ParserState;
}) => {
    num: number;
    blockSize: number;
    sampleRate: number;
} | null;
export declare const parseFlacFrame: ({ state, iterator, }: {
    state: ParserState;
    iterator: BufferIterator;
}) => Promise<ParseResult>;
