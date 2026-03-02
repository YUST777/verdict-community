import type { MediaParserController } from './controller/media-parser-controller';
import type { PrefetchCache } from './fetch';
import type { BufferIterator } from './iterator/buffer-iterator';
import type { MediaParserLogLevel } from './log';
import type { ParseMediaSrc } from './options';
import type { MediaParserReaderInterface } from './readers/reader';
import type { CurrentReader } from './state/current-reader';
export declare const seekBackwards: ({ iterator, seekTo, readerInterface, src, controller, logLevel, currentReader, prefetchCache, }: {
    iterator: BufferIterator;
    seekTo: number;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    currentReader: CurrentReader;
    prefetchCache: PrefetchCache;
}) => Promise<void>;
