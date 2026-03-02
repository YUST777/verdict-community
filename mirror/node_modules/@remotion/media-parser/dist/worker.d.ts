export { hasBeenAborted, ImageType, IsAnImageError, IsAnUnsupportedFileTypeError, IsAPdfError, MediaParserAbortError, } from './errors';
import type { ParseMediaOnWorker } from './options';
export type { ParseMediaOnWorker, ParseMediaOnWorkerOptions } from './options';
export declare const parseMediaOnWebWorker: ParseMediaOnWorker;
