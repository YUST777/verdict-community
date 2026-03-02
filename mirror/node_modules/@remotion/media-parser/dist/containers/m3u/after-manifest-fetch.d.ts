import type { MediaParserLogLevel } from '../../log';
import type { MediaParserReaderInterface } from '../../readers/reader';
import type { CanSkipTracksState } from '../../state/can-skip-tracks';
import type { M3uState } from '../../state/m3u-state';
import type { MediaParserOnAudioTrack } from '../../webcodec-sample-types';
import type { SelectM3uAssociatedPlaylistsFn, SelectM3uStreamFn } from './select-stream';
import type { M3uStructure } from './types';
export declare const afterManifestFetch: ({ structure, m3uState, src, selectM3uStreamFn, logLevel, selectAssociatedPlaylistsFn, readerInterface, onAudioTrack, canSkipTracks, }: {
    structure: M3uStructure;
    m3uState: M3uState;
    src: string;
    selectM3uStreamFn: SelectM3uStreamFn;
    selectAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
    logLevel: MediaParserLogLevel;
    readerInterface: MediaParserReaderInterface;
    onAudioTrack: MediaParserOnAudioTrack | null;
    canSkipTracks: CanSkipTracksState;
}) => Promise<void>;
