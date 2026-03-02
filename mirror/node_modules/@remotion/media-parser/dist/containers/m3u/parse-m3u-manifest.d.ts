import type { BufferIterator } from '../../iterator/buffer-iterator';
import type { ParseResult } from '../../parse-result';
import type { M3uStructure } from './types';
export declare const parseM3uManifest: ({ iterator, structure, contentLength, }: {
    iterator: BufferIterator;
    structure: M3uStructure;
    contentLength: number;
}) => Promise<ParseResult>;
