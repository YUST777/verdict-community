export declare const getPrecomposeRectFor3DTransform: ({ element, parentRect, matrix, }: {
    element: HTMLElement | SVGElement;
    parentRect: DOMRect;
    matrix: DOMMatrix;
}) => DOMRect | null;
export declare const handle3dTransform: ({ matrix, sourceRect, tempCanvas, rectAfterTransforms, internalState, scale, }: {
    matrix: DOMMatrix;
    sourceRect: DOMRect;
    tempCanvas: OffscreenCanvas;
    rectAfterTransforms: DOMRect;
    internalState: {
        getDrawn3dPixels: () => number;
        getPrecomposedTiles: () => number;
        addPrecompose: ({ canvasWidth, canvasHeight, }: {
            canvasWidth: number;
            canvasHeight: number;
        }) => void;
        helperCanvasState: import("../internal-state").HelperCanvasState;
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
}) => OffscreenCanvas | null;
