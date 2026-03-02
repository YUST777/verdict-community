import type { Options, ParseMediaFields } from '../fields';
import type { MediaParserStructureUnstable } from '../parse-result';
import type { StructureState } from './structure';
export declare const needsTracksForField: ({ field, structure, }: {
    field: keyof Options<ParseMediaFields>;
    structure: MediaParserStructureUnstable | null;
}) => boolean;
export declare const makeCanSkipTracksState: ({ hasAudioTrackHandlers, fields, hasVideoTrackHandlers, structure, }: {
    hasAudioTrackHandlers: boolean;
    hasVideoTrackHandlers: boolean;
    fields: Options<ParseMediaFields>;
    structure: StructureState;
}) => {
    doFieldsNeedTracks: () => boolean;
    canSkipTracks: () => boolean;
};
export type CanSkipTracksState = ReturnType<typeof makeCanSkipTracksState>;
