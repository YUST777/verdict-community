import type { ParseResult } from './parse-result';
import type { ParserState } from './state/parser-state';
export declare const runParseIteration: ({ state, }: {
    state: ParserState;
}) => Promise<ParseResult>;
