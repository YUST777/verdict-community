import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../log';
import type { IsoBaseMediaBox } from './base-media-box';
import type { OnlyIfMoovAtomExpected } from './process-box';
export declare const getIsoBaseMediaChildren: ({ size, iterator, logLevel, onlyIfMoovAtomExpected, contentLength, }: {
    size: number;
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected | null;
    contentLength: number;
}) => Promise<IsoBaseMediaBox[]>;
