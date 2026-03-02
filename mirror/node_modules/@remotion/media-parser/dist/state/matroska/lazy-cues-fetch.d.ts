import type { MatroskaCue } from '../../containers/webm/seek/format-cues';
import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import type { MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
import type { WebmSeekingHints } from '../../seeking-hints';
export declare const lazyCuesFetch: ({ controller, logLevel, readerInterface, src, prefetchCache, }: {
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    prefetchCache: PrefetchCache;
}) => {
    triggerLoad: (position: number, segmentOffset: number) => Promise<MatroskaCue[] | null>;
    getLoadedCues: () => Promise<{
        cues: MatroskaCue[];
        segmentOffset: number;
    } | null>;
    getIfAlreadyLoaded: () => {
        cues: MatroskaCue[];
        segmentOffset: number;
    } | null;
    setFromSeekingHints: (hints: WebmSeekingHints) => void;
};
export type LazyCuesFetch = ReturnType<typeof lazyCuesFetch>;
export type LazyCuesLoadedOrNull = Awaited<ReturnType<LazyCuesFetch['getLoadedCues']>>;
