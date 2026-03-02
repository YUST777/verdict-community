import type { MediaParserTrack } from '../../get-tracks';
import type { MediaParserLogLevel } from '../../log';
import type { IsoBaseMediaStructure } from '../../parse-result';
import type { IsoBaseMediaSeekingHints } from '../../seeking-hints';
import type { IsoBaseMediaState } from '../../state/iso-base-media/iso-state';
import type { StructureState } from '../../state/structure';
import type { SeekResolution } from '../../work-on-seek-request';
export declare const getSeekingByteFromFragmentedMp4: ({ info, time, logLevel, currentPosition, isoState, tracks, isLastChunkInPlaylist, structure, mp4HeaderSegment, }: {
    info: IsoBaseMediaSeekingHints;
    time: number;
    logLevel: MediaParserLogLevel;
    currentPosition: number;
    isoState: IsoBaseMediaState;
    structure: StructureState;
    tracks: MediaParserTrack[];
    isLastChunkInPlaylist: boolean;
    mp4HeaderSegment: IsoBaseMediaStructure | null;
}) => Promise<SeekResolution>;
