import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParserState } from '../../state/parser-state';
export declare const parseMetaBlock: ({ iterator, state, }: {
    iterator: BufferIterator;
    state: ParserState;
}) => Promise<import("../../parse-result").ParseResult>;
