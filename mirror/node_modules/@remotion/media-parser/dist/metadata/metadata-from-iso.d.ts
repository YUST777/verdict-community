import type { RegularBox } from '../containers/iso-base-media/base-media-box';
import type { ParserState } from '../state/parser-state';
import type { MediaParserMetadataEntry } from './get-metadata';
export declare const parseIsoMetaBox: (meta: RegularBox, trackId: number | null) => MediaParserMetadataEntry[];
export declare const getMetadataFromIsoBase: (state: ParserState) => MediaParserMetadataEntry[];
