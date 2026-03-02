export declare const compose: ({ element, context, logLevel, parentRect, internalState, onlyBackgroundClipText, scale, }: {
    element: HTMLElement | SVGElement;
    context: OffscreenCanvasRenderingContext2D;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    parentRect: DOMRect;
    internalState: {
        getDrawn3dPixels: () => number;
        getPrecomposedTiles: () => number;
        addPrecompose: ({ canvasWidth, canvasHeight, }: {
            canvasWidth: number;
            canvasHeight: number;
        }) => void;
        helperCanvasState: import("./internal-state").HelperCanvasState;
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
    onlyBackgroundClipText: boolean;
    scale: number;
}) => Promise<void>;
