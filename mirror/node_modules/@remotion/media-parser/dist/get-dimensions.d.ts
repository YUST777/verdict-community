import type { ParserState } from './state/parser-state';
export type MediaParserDimensions = {
    width: number;
    height: number;
};
export type ExpandedDimensions = MediaParserDimensions & {
    rotation: number;
    unrotatedWidth: number;
    unrotatedHeight: number;
};
export declare const getDimensions: (state: ParserState) => ExpandedDimensions | null;
export declare const hasDimensions: (state: ParserState) => boolean;
