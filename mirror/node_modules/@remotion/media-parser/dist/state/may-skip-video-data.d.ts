import type { ParserState } from './parser-state';
export declare const missesMatroskaTracks: (state: ParserState) => boolean;
export declare const maySkipVideoData: ({ state }: {
    state: ParserState;
}) => boolean;
export declare const maySkipOverSamplesInTheMiddle: ({ state, }: {
    state: ParserState;
}) => boolean;
