import type { DelayRenderScope } from 'remotion';
import type { BackgroundKeepalive } from './background-keepalive';
export declare const waitForReady: ({ timeoutInMilliseconds, scope, signal, apiName, internalState, keepalive, }: {
    timeoutInMilliseconds: number;
    scope: DelayRenderScope;
    signal: AbortSignal | null;
    apiName: "renderMediaOnWeb" | "renderStillOnWeb";
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
    } | null;
    keepalive: BackgroundKeepalive | null;
}) => Promise<void>;
