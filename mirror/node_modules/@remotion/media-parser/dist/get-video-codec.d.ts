import type { MediaParserCodecData } from './codec-data';
import type { TrakBox } from './containers/iso-base-media/trak/trak';
import { type MediaParserAdvancedColor, type MediaParserVideoCodec } from './get-tracks';
import type { ParserState } from './state/parser-state';
export declare const getVideoCodec: (state: ParserState) => MediaParserVideoCodec | null;
export declare const hasVideoCodec: (state: ParserState) => boolean;
export declare const getVideoPrivateData: (trakBox: TrakBox) => MediaParserCodecData | null;
export declare const getIsoBmColrConfig: (trakBox: TrakBox) => MediaParserAdvancedColor | null;
export declare const getVideoCodecString: (trakBox: TrakBox) => string | null;
