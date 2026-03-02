import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare const parseVorbisComment: ({ state, iterator, size, }: {
    state: ParserState;
    iterator: BufferIterator;
    size: number;
}) => Promise<ParseResult>;
