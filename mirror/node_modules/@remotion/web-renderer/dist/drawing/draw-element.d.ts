import type { DrawFn } from './drawn-fn';
export declare const drawElement: ({ rect, computedStyle, context, draw, opacity, totalMatrix, parentRect, logLevel, element, internalState, scale, }: {
    rect: DOMRect;
    computedStyle: CSSStyleDeclaration;
    context: OffscreenCanvasRenderingContext2D;
    opacity: number;
    totalMatrix: DOMMatrix;
    draw: DrawFn;
    parentRect: DOMRect;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    element: HTMLElement | SVGElement;
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
}) => Promise<{
    cleanupAfterChildren: () => void;
}>;
