import type { MediaParserController } from '../../../controller/media-parser-controller';
import type { PrefetchCache } from '../../../fetch';
import { type MediaParserLogLevel } from '../../../log';
import type { ParseMediaSrc } from '../../../options';
import type { MediaParserReaderInterface } from '../../../readers/reader';
export declare const fetchIdx1: ({ src, readerInterface, controller, position, logLevel, prefetchCache, contentLength, }: {
    src: ParseMediaSrc;
    readerInterface: MediaParserReaderInterface;
    controller: MediaParserController;
    position: number;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
    contentLength: number;
}) => Promise<{
    entries: import("../riff-box").Idx1Entry[];
    videoTrackIndex: number | null;
}>;
export type FetchIdx1Result = Awaited<ReturnType<typeof fetchIdx1>>;
