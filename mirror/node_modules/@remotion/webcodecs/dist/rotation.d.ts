import type { MediaParserDimensions } from '@remotion/media-parser';
import type { ResizeOperation } from './resizing/mode';
export declare const calculateNewDimensionsFromRotate: ({ height, width, rotation, }: MediaParserDimensions & {
    rotation: number;
}) => {
    height: number;
    width: number;
};
export declare const calculateNewDimensionsFromRotateAndScale: ({ width, height, rotation, resizeOperation, needsToBeMultipleOfTwo, }: {
    width: number;
    height: number;
    rotation: number;
    resizeOperation: ResizeOperation | null;
    needsToBeMultipleOfTwo: boolean;
}) => MediaParserDimensions;
