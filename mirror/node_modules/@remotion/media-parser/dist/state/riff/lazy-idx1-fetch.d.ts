import type { RiffSeekingHints } from '../../containers/riff/seeking-hints';
import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import type { MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
export declare const lazyIdx1Fetch: ({ controller, logLevel, readerInterface, src, prefetchCache, contentLength, }: {
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    prefetchCache: PrefetchCache;
    contentLength: number;
}) => {
    triggerLoad: (position: number) => Promise<{
        entries: import("../../containers/riff/riff-box").Idx1Entry[];
        videoTrackIndex: number | null;
    }>;
    getLoadedIdx1: () => Promise<{
        entries: import("../../containers/riff/riff-box").Idx1Entry[];
        videoTrackIndex: number | null;
    } | null>;
    getIfAlreadyLoaded: () => {
        entries: import("../../containers/riff/riff-box").Idx1Entry[];
        videoTrackIndex: number | null;
    } | null;
    setFromSeekingHints: (hints: RiffSeekingHints) => void;
    waitForLoaded: () => Promise<{
        entries: import("../../containers/riff/riff-box").Idx1Entry[];
        videoTrackIndex: number | null;
    }> | Promise<null>;
};
export type LazyIdx1Fetch = ReturnType<typeof lazyIdx1Fetch>;
