import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../../log';
import type { AnySegment } from '../../../parse-result';
import type { BaseBox } from '../base-type';
export interface MebxBox extends BaseBox {
    type: 'mebx-box';
    dataReferenceIndex: number;
    format: string;
    children: AnySegment[];
}
export declare const parseMebx: ({ offset, size, iterator, logLevel, contentLength, }: {
    offset: number;
    size: number;
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    contentLength: number;
}) => Promise<MebxBox>;
