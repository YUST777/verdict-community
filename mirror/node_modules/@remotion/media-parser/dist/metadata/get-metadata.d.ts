import type { MediaParserStructureUnstable } from '../parse-result';
import type { ParserState } from '../state/parser-state';
export type MediaParserMetadataEntry = {
    key: string;
    value: string | number;
    trackId: number | null;
};
export declare const getMetadata: (state: ParserState) => MediaParserMetadataEntry[];
export declare const hasMetadata: (structure: MediaParserStructureUnstable) => boolean;
