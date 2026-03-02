import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../../log';
import type { AnySegment } from '../../../parse-result';
import type { BaseBox } from '../base-type';
export interface TrakBox extends BaseBox {
    type: 'trak-box';
    children: AnySegment[];
}
export declare const parseTrak: ({ size, offsetAtStart, iterator, logLevel, contentLength, }: {
    size: number;
    offsetAtStart: number;
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    contentLength: number;
}) => Promise<TrakBox>;
