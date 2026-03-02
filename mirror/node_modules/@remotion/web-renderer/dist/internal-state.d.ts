type HelperCanvas = {
    canvas: OffscreenCanvas;
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    locations: {
        aPosition: number;
        aTexCoord: number;
        uTransform: WebGLUniformLocation | null;
        uResolution: WebGLUniformLocation | null;
        uOffset: WebGLUniformLocation | null;
        uTexture: WebGLUniformLocation | null;
    };
    cleanup: () => void;
};
export type HelperCanvasState = {
    current: HelperCanvas | null;
};
export declare const makeInternalState: () => {
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
export type InternalState = ReturnType<typeof makeInternalState>;
export {};
