import type { DrawFn } from './drawn-fn';
export type ProcessNodeReturnValue = {
    type: 'continue';
    cleanupAfterChildren: null | (() => void);
} | {
    type: 'skip-children';
};
export declare const processNode: ({ element, context, draw, logLevel, parentRect, internalState, rootElement, scale, }: {
    element: HTMLElement | SVGElement;
    context: OffscreenCanvasRenderingContext2D;
    draw: DrawFn;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    parentRect: DOMRect;
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
    rootElement: HTMLElement | SVGElement;
    scale: number;
}) => Promise<ProcessNodeReturnValue>;
