import type { MediaParserDimensions } from '@remotion/media-parser';
import type { ResizeOperation } from './mode';
export declare const calculateNewSizeAfterResizing: ({ dimensions, resizeOperation, needsToBeMultipleOfTwo, }: {
    dimensions: MediaParserDimensions;
    resizeOperation: ResizeOperation | null;
    needsToBeMultipleOfTwo: boolean;
}) => MediaParserDimensions;
