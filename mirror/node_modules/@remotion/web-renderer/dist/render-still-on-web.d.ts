import { type LogLevel } from 'remotion';
import type { $ZodObject } from 'zod/v4/core';
import type { WebRendererOnArtifact } from './artifact';
import type { CompositionCalculateMetadataOrExplicit } from './props-if-has-props';
import type { InputPropsIfHasProps } from './render-media-on-web';
export type RenderStillOnWebImageFormat = 'png' | 'jpeg' | 'webp';
type MandatoryRenderStillOnWebOptions<Schema extends $ZodObject, Props extends Record<string, unknown>> = {
    frame: number;
    imageFormat: RenderStillOnWebImageFormat;
} & {
    composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};
type OptionalRenderStillOnWebOptions<Schema extends $ZodObject> = {
    delayRenderTimeoutInMilliseconds: number;
    logLevel: LogLevel;
    schema: Schema | undefined;
    mediaCacheSizeInBytes: number | null;
    signal: AbortSignal | null;
    onArtifact: WebRendererOnArtifact | null;
    licenseKey: string | null;
    scale: number;
    isProduction: boolean;
};
export type RenderStillOnWebOptions<Schema extends $ZodObject, Props extends Record<string, unknown>> = MandatoryRenderStillOnWebOptions<Schema, Props> & Partial<OptionalRenderStillOnWebOptions<Schema>> & InputPropsIfHasProps<Schema, Props>;
export declare const renderStillOnWeb: <Schema extends $ZodObject<Readonly<Readonly<{
    [k: string]: import("zod/v4/core").$ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>;
}>>, import("zod/v4/core").$ZodObjectConfig>, Props extends Record<string, unknown>>(options: RenderStillOnWebOptions<Schema, Props>) => Promise<{
    blob: Blob;
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
}>;
export {};
