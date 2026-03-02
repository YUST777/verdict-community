import type { MediaParserLogLevel } from '../../log';
import type { M3uState } from '../../state/m3u-state';
import type { SeekResolution } from '../../work-on-seek-request';
export declare const clearM3uStateInPrepareForSeek: ({ m3uState, logLevel, }: {
    m3uState: M3uState;
    logLevel: MediaParserLogLevel;
}) => void;
export declare const getSeekingByteForM3u8: ({ time, currentPosition, m3uState, logLevel, }: {
    time: number;
    currentPosition: number;
    m3uState: M3uState;
    logLevel: MediaParserLogLevel;
}) => SeekResolution;
