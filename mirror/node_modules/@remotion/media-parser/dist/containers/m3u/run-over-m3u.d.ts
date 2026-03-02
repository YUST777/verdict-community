import type { MediaParserLogLevel } from '../../log';
import type { ParserState } from '../../state/parser-state';
import type { M3uStructure } from './types';
export declare const runOverM3u: ({ state, structure, playlistUrl, logLevel, }: {
    state: ParserState;
    structure: M3uStructure;
    playlistUrl: string;
    logLevel: MediaParserLogLevel;
}) => Promise<void>;
