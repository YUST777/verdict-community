import type { IsoBaseMediaBox } from '../../containers/iso-base-media/base-media-box';
import type { MediaParserController } from '../../controller/media-parser-controller';
import type { PrefetchCache } from '../../fetch';
import { type MediaParserLogLevel } from '../../log';
import type { ParseMediaSrc } from '../../options';
import type { MediaParserReaderInterface } from '../../readers/reader';
import type { IsoBaseMediaSeekingHints } from '../../seeking-hints';
export declare const lazyMfraLoad: ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }: {
    contentLength: number;
    controller: MediaParserController;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    logLevel: MediaParserLogLevel;
    prefetchCache: PrefetchCache;
}) => {
    triggerLoad: () => Promise<IsoBaseMediaBox[] | null>;
    getIfAlreadyLoaded: () => IsoBaseMediaBox[] | null;
    setFromSeekingHints: (hints: IsoBaseMediaSeekingHints) => void;
};
