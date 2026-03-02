import type { Options, ParseMediaFields } from './fields';
import type { ParserState } from './state/parser-state';
export declare const getAvailableInfo: ({ state, }: {
    state: ParserState;
}) => Record<keyof Options<ParseMediaFields>, boolean>;
export declare const hasAllInfo: ({ state }: {
    state: ParserState;
}) => boolean;
