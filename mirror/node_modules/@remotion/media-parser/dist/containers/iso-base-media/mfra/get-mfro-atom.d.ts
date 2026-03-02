import type { MediaParserController } from '../../../controller/media-parser-controller';
import type { PrefetchCache } from '../../../fetch';
import type { MediaParserLogLevel } from '../../../log';
import type { ParseMediaSrc } from '../../../options';
import type { MediaParserReaderInterface } from '../../../readers/reader';
export declare const getMfroAtom: ({ src, contentLength, readerInterface, controller, logLevel, prefetchCache, }: {
    src: ParseMediaSrc;
    contentLength: number;
    readerInterface: MediaParserReaderInterface;
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
}) => Promise<number | null>;
