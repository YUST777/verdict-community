import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare const parseStreamInfo: ({ iterator, state, }: {
    iterator: BufferIterator;
    state: ParserState;
}) => Promise<ParseResult>;
