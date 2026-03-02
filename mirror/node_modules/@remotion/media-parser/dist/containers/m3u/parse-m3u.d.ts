import type { ParserState } from '../../state/parser-state';
export declare const parseM3u: ({ state }: {
    state: ParserState;
}) => Promise<import("../../parse-result").ParseResult>;
