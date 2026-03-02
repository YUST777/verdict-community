import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import type { MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
import type { IsoBaseMediaBox } from './base-media-box';
export type MfraSeekingBoxOptions = {
    contentLength: number;
    controller: MediaParserController;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
};
export declare const getMfraSeekingBox: ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }: MfraSeekingBoxOptions) => Promise<IsoBaseMediaBox[] | null>;
