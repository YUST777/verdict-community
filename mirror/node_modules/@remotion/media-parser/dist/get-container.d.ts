import type { MediaParserContainer } from './options';
import type { MediaParserStructureUnstable } from './parse-result';
export declare const getContainer: (segments: MediaParserStructureUnstable) => MediaParserContainer;
export declare const hasContainer: (boxes: MediaParserStructureUnstable) => boolean;
