import type { MediaParserTrack } from '../../get-tracks';
import type { ParserState } from '../../state/parser-state';
import type { TransportStreamEntry } from './parse-pmt';
export declare const filterStreamsBySupportedTypes: (streams: TransportStreamEntry[]) => TransportStreamEntry[];
export declare const getTracksFromTransportStream: (parserState: ParserState) => MediaParserTrack[];
export declare const hasAllTracksFromTransportStream: (parserState: ParserState) => boolean;
