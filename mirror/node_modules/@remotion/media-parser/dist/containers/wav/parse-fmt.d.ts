import type { ParseResult } from '../../parse-result';
import type { ParserState } from '../../state/parser-state';
export declare function getChannelsFromMask(channelMask: number): string[];
export declare const parseFmt: ({ state, }: {
    state: ParserState;
}) => Promise<ParseResult>;
