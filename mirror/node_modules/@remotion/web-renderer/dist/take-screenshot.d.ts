export declare const createLayer: ({ element, scale, logLevel, internalState, onlyBackgroundClipText, cutout, }: {
    element: HTMLElement | SVGElement;
    scale: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
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
    cutout: DOMRect;
}) => Promise<OffscreenCanvasRenderingContext2D>;
