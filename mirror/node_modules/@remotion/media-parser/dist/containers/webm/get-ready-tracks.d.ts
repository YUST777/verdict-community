import type { MediaParserTrack } from '../../get-tracks';
import type { WebmState } from '../../state/matroska/webm';
import type { StructureState } from '../../state/structure';
export type ResolvedAndUnresolvedTracks = {
    resolved: MediaParserTrack[];
    missingInfo: MediaParserTrack[];
};
export declare const getTracksFromMatroska: ({ structureState, webmState, }: {
    structureState: StructureState;
    webmState: WebmState;
}) => ResolvedAndUnresolvedTracks;
export declare const matroskaHasTracks: ({ structureState, webmState, }: {
    structureState: StructureState;
    webmState: WebmState;
}) => boolean;
