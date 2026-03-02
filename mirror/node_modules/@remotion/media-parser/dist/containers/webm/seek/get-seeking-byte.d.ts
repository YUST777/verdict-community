import type { MediaParserLogLevel } from '../../../log';
import type { WebmSeekingHints } from '../../../seeking-hints';
import type { WebmState } from '../../../state/matroska/webm';
import type { MediaSectionState } from '../../../state/video-section';
import type { SeekResolution } from '../../../work-on-seek-request';
export declare const getSeekingByteFromMatroska: ({ time, webmState, info, logLevel, mediaSection, }: {
    time: number;
    webmState: WebmState;
    info: WebmSeekingHints;
    logLevel: MediaParserLogLevel;
    mediaSection: MediaSectionState;
}) => Promise<SeekResolution>;
