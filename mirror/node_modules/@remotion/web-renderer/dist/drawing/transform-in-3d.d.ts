import type { HelperCanvasState } from '../internal-state';
export declare const transformIn3d: ({ matrix, sourceCanvas, sourceRect, destRect, internalState, scale, }: {
    sourceRect: DOMRect;
    matrix: DOMMatrix;
    sourceCanvas: OffscreenCanvas;
    destRect: DOMRect;
    internalState: {
        getDrawn3dPixels: () => number;
        getPrecomposedTiles: () => number;
        addPrecompose: ({ canvasWidth, canvasHeight, }: {
            canvasWidth: number;
            canvasHeight: number;
        }) => void;
        helperCanvasState: HelperCanvasState;
        [Symbol.dispose]: () => void;
        getWaitForReadyTime: () => number;
        addWaitForReadyTime: (time: number) => void;
        getAddSampleTime: () => number;
        addAddSampleTime: (time: number) => void;
        getCreateFrameTime: () => number;
        addCreateFrameTime: (time: number) => void;
        getAudioMixingTime: () => number;
        addAudioMixingTime: (time: number) => void;
    };
    scale: number;
}) => OffscreenCanvas;
