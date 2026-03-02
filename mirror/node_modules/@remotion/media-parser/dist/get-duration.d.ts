import type { AnySegment } from './parse-result';
import type { ParserState } from './state/parser-state';
export declare const isMatroska: (boxes: AnySegment[]) => {
    type: "Segment";
    value: import("./containers/webm/segments/all-segments").PossibleEbml[];
    minVintWidth: number | null;
} | undefined;
export declare const getDuration: (parserState: ParserState) => number | null;
export declare const hasDuration: (parserState: ParserState) => boolean;
export declare const hasSlowDuration: (parserState: ParserState) => boolean;
