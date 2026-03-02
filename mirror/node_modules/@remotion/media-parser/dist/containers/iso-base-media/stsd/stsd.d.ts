import type { BufferIterator } from '../../../iterator/buffer-iterator';
import type { MediaParserLogLevel } from '../../../log';
import type { BaseBox } from '../base-type';
import type { Sample } from './samples';
export interface StsdBox extends BaseBox {
    type: 'stsd-box';
    numberOfEntries: number;
    samples: Sample[];
}
export declare const parseStsd: ({ offset, size, iterator, logLevel, contentLength, }: {
    offset: number;
    size: number;
    iterator: BufferIterator;
    logLevel: MediaParserLogLevel;
    contentLength: number;
}) => Promise<StsdBox>;
