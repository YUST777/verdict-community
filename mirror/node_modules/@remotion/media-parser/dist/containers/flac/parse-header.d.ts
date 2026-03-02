import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare const parseFlacHeader: ({ state, }: {
    state: ParserState;
    iterator: BufferIterator;
}) => Promise<ParseResult>;
