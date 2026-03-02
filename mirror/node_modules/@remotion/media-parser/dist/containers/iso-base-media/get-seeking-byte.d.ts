import type { MediaParserLogLevel } from '../../log';
import type { M3uPlaylistContext } from '../../options';
import type { IsoBaseMediaSeekingHints } from '../../seeking-hints';
import type { IsoBaseMediaState } from '../../state/iso-base-media/iso-state';
import type { StructureState } from '../../state/structure';
import type { SeekResolution } from '../../work-on-seek-request';
export declare const getSeekingByteFromIsoBaseMedia: ({ info, time, logLevel, currentPosition, isoState, m3uPlaylistContext, structure, }: {
    info: IsoBaseMediaSeekingHints;
    time: number;
    logLevel: MediaParserLogLevel;
    currentPosition: number;
    isoState: IsoBaseMediaState;
    m3uPlaylistContext: M3uPlaylistContext | null;
    structure: StructureState;
}) => Promise<SeekResolution>;
