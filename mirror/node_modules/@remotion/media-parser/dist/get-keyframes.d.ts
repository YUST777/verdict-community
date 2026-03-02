import type { MediaParserKeyframe } from './options';
import type { ParserState } from './state/parser-state';
export declare const getKeyframes: (state: ParserState) => MediaParserKeyframe[] | null;
export declare const hasKeyframes: (parserState: ParserState) => boolean;
