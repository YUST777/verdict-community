import type { IsoBaseMediaStructure } from '../../parse-result';
import type { IsoBaseMediaSeekingHints } from '../../seeking-hints';
import type { IsoBaseMediaState } from '../../state/iso-base-media/iso-state';
import type { ParserState } from '../../state/parser-state';
import type { StructureState } from '../../state/structure';
import type { MediaSectionState } from '../../state/video-section';
export declare const getSeekingHintsFromMp4: ({ structureState, isoState, mp4HeaderSegment, mediaSectionState, }: {
    structureState: StructureState;
    isoState: IsoBaseMediaState;
    mp4HeaderSegment: IsoBaseMediaStructure | null;
    mediaSectionState: MediaSectionState;
}) => IsoBaseMediaSeekingHints | null;
export declare const setSeekingHintsForMp4: ({}: {
    hints: IsoBaseMediaSeekingHints;
    state: ParserState;
}) => void;
