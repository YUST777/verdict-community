import type { ResizeOperation } from './resizing/mode';
export declare const normalizeVideoRotation: (rotation: number) => number;
export declare const rotateAndResizeVideoFrame: ({ frame, rotation, needsToBeMultipleOfTwo, resizeOperation, }: {
    frame: VideoFrame;
    rotation: number;
    resizeOperation: ResizeOperation | null;
    needsToBeMultipleOfTwo?: boolean | undefined;
}) => VideoFrame;
