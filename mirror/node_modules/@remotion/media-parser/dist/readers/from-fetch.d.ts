import type { MediaParserController } from '../controller/media-parser-controller';
import type { ParseMediaRange } from '../options';
import type { CreateAdjacentFileSource, MediaParserReaderInterface, PreloadContent, ReadContent, ReadWholeAsText } from './reader';
interface ParsedContentRange {
    unit: string;
    start?: number | null;
    end?: number | null;
    size?: number | null;
}
/**
 * Parse Content-Range header.
 * From: https://github.com/gregberge/content-range/blob/main/src/index.ts
 */
export declare function parseContentRange(input: string): ParsedContentRange | null;
export declare const makeFetchRequest: ({ range, src, controller, }: {
    range: ParseMediaRange;
    src: string | URL;
    controller: MediaParserController | null;
}) => Promise<{
    contentLength: number | null;
    needsContentRange: boolean;
    reader: import("./reader").Reader;
    name: string | undefined;
    contentType: string | null;
    supportsContentRange: boolean;
}>;
export type PrefetchCache = Map<string, ReturnType<typeof makeFetchRequest>>;
export declare const fetchReadContent: ReadContent;
export declare const fetchPreload: PreloadContent;
export declare const fetchReadWholeAsText: ReadWholeAsText;
export declare const fetchCreateAdjacentFileSource: CreateAdjacentFileSource;
export declare const fetchReader: MediaParserReaderInterface;
export {};
