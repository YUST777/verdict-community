import type { Options, ParseMediaFields } from './fields';
import type { ParserState } from './state/parser-state';
export declare const emitAvailableInfo: ({ hasInfo, state, }: {
    hasInfo: Record<keyof Options<ParseMediaFields>, boolean>;
    state: ParserState;
}) => Promise<void>;
