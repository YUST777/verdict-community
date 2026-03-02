import type { MediaParserReaderInterface } from '../../readers/reader';
import type { M3uBox } from './types';
export declare const fetchM3u8Stream: ({ url, readerInterface, }: {
    url: string;
    readerInterface: MediaParserReaderInterface;
}) => Promise<M3uBox[]>;
