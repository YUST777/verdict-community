import type { MediaParserDimensions } from '../../get-dimensions';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserStructureUnstable } from '../../parse-result';
import type { MediaParserReaderInterface } from '../../readers/reader';
import type { ParserState } from '../../state/parser-state';
export type M3uAssociatedPlaylist = {
    groupId: string;
    language: string | null;
    name: string | null;
    autoselect: boolean;
    default: boolean;
    channels: number | null;
    src: string;
    id: number;
    isAudio: boolean;
};
export type M3uStream = {
    src: string;
    bandwidthInBitsPerSec: number | null;
    averageBandwidthInBitsPerSec: number | null;
    dimensions: MediaParserDimensions | null;
    codecs: string[] | null;
    id: number;
    associatedPlaylists: M3uAssociatedPlaylist[];
};
export declare const isIndependentSegments: (structure: MediaParserStructureUnstable | null) => boolean;
export declare const getM3uStreams: ({ structure, originalSrc, readerInterface, }: {
    structure: MediaParserStructureUnstable | null;
    originalSrc: ParseMediaSrc;
    readerInterface: MediaParserReaderInterface;
}) => M3uStream[] | null;
export declare const m3uHasStreams: (state: ParserState) => boolean;
