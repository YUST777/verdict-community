import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../../log';
import type { AnySegment } from '../../../parse-result';
import type { BaseBox } from '../base-type';
import type { OnlyIfMoovAtomExpected } from '../process-box';
export interface MoovBox extends BaseBox {
    type: 'moov-box';
    children: AnySegment[];
}
export declare const parseMoov: ({ offset, size, onlyIfMoovAtomExpected, iterator, logLevel, contentLength, }: {
    offset: number;
    size: number;
    onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected;
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    contentLength: number;
}) => Promise<MoovBox>;
