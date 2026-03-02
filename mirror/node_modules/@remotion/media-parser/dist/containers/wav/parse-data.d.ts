import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare const parseData: ({ state, }: {
    state: ParserState;
}) => Promise<ParseResult>;
