import type { ParserState } from './state/parser-state';
export declare const makeProgressObject: (state: ParserState) => {
    bytes: number;
    percentage: number | null;
    totalBytes: number;
};
