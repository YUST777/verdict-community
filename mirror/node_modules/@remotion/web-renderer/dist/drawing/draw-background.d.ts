export declare const drawBackground: ({ backgroundImage, context, rect, backgroundColor, backgroundClip, element, logLevel, internalState, computedStyle, offsetLeft: parentOffsetLeft, offsetTop: parentOffsetTop, scale, }: {
    backgroundImage: string;
    context: OffscreenCanvasRenderingContext2D;
    rect: DOMRect;
    backgroundColor: string;
    backgroundClip: string;
    element: HTMLElement | SVGElement;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
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
    computedStyle: CSSStyleDeclaration;
    offsetLeft: number;
    offsetTop: number;
    scale: number;
}) => Promise<void>;
