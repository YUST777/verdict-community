import type { ParseMediaOnError } from './options';
import type { ParserState } from './state/parser-state';
import type { ThrottledState } from './throttled-progress';
export declare const parseLoop: ({ state, throttledState, onError, }: {
    state: ParserState;
    throttledState: ThrottledState;
    onError: ParseMediaOnError;
}) => Promise<void>;
