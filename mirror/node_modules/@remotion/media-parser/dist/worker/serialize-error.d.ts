import type { MediaParserLogLevel } from '../log';
import type { SeekingHints } from '../seeking-hints';
import type { ResponseError } from './worker-types';
export declare const serializeError: ({ error, logLevel, seekingHints, }: {
    error: Error;
    logLevel: MediaParserLogLevel;
    seekingHints: SeekingHints | null;
}) => ResponseError;
export declare const deserializeError: (error: ResponseError) => Error;
