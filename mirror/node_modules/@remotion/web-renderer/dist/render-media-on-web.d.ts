import { type LogLevel } from 'remotion';
import type { z } from 'zod';
import type { $ZodObject } from 'zod/v4/core';
import { type WebRendererOnArtifact } from './artifact';
import { type FrameRange } from './frame-range';
import type { InternalState } from './internal-state';
import type { WebRendererAudioCodec, WebRendererContainer, WebRendererQuality } from './mediabunny-mappings';
import { type WebRendererVideoCodec } from './mediabunny-mappings';
import type { WebRendererOutputTarget } from './output-target';
import type { CompositionCalculateMetadataOrExplicit } from './props-if-has-props';
import { type OnFrameCallback } from './validate-video-frame';
export type InputPropsIfHasProps<Schema extends $ZodObject, Props> = $ZodObject extends Schema ? {} extends Props ? {
    inputProps?: z.input<Schema> & Props;
} : {
    inputProps: Props;
} : {} extends Props ? {
    inputProps: z.input<Schema>;
} : {
    inputProps: z.input<Schema> & Props;
};
type MandatoryRenderMediaOnWebOptions<Schema extends $ZodObject, Props extends Record<string, unknown>> = {
    composition: CompositionCalculateMetadataOrExplicit<Schema, Props>;
};
export type RenderMediaOnWebProgress = {
    renderedFrames: number;
    encodedFrames: number;
};
export type RenderMediaOnWebResult = {
    getBlob: () => Promise<Blob>;
    internalState: InternalState;
};
export type RenderMediaOnWebProgressCallback = (progress: RenderMediaOnWebProgress) => void;
export type WebRendererHardwareAcceleration = 'no-preference' | 'prefer-hardware' | 'prefer-software';
type OptionalRenderMediaOnWebOptions<Schema extends $ZodObject> = {
    delayRenderTimeoutInMilliseconds: number;
    logLevel: LogLevel;
    schema: Schema | undefined;
    mediaCacheSizeInBytes: number | null;
    videoCodec: WebRendererVideoCodec;
    audioCodec: WebRendererAudioCodec | null;
    audioBitrate: number | WebRendererQuality;
    container: WebRendererContainer;
    signal: AbortSignal | null;
    onProgress: RenderMediaOnWebProgressCallback | null;
    hardwareAcceleration: WebRendererHardwareAcceleration;
    keyframeIntervalInSeconds: number;
    videoBitrate: number | WebRendererQuality;
    frameRange: FrameRange | null;
    transparent: boolean;
    onArtifact: WebRendererOnArtifact | null;
    onFrame: OnFrameCallback | null;
    outputTarget: WebRendererOutputTarget | null;
    licenseKey: string | null;
    isProduction: boolean;
    muted: boolean;
    scale: number;
};
export type RenderMediaOnWebOptions<Schema extends $ZodObject, Props extends Record<string, unknown>> = MandatoryRenderMediaOnWebOptions<Schema, Props> & Partial<OptionalRenderMediaOnWebOptions<Schema>> & InputPropsIfHasProps<Schema, Props>;
export declare const renderMediaOnWeb: <Schema extends $ZodObject<Readonly<Readonly<{
    [k: string]: z.core.$ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}>>, z.core.$ZodObjectConfig>, Props extends Record<string, unknown>>(options: RenderMediaOnWebOptions<Schema, Props>) => Promise<RenderMediaOnWebResult>;
export {};
