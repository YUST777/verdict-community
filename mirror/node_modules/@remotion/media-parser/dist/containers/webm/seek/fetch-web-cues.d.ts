import type { MediaParserController } from '../../../controller/media-parser-controller';
import type { PrefetchCache } from '../../../fetch';
import type { MediaParserLogLevel } from '../../../log';
import type { ParseMediaSrc } from '../../../options';
import type { MediaParserReaderInterface } from '../../../readers/reader';
import type { MatroskaCue } from './format-cues';
export declare const fetchWebmCues: ({ src, readerInterface, controller, position, logLevel, prefetchCache, }: {
    src: ParseMediaSrc;
    readerInterface: MediaParserReaderInterface;
    controller: MediaParserController;
    position: number;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
}) => Promise<MatroskaCue[] | null>;
