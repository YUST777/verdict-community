import type { ComponentType } from 'react';
import type { CalculateMetadataFunction } from 'remotion';
import type { z } from 'zod';
import type { $ZodObject } from 'zod/v4/core';
export type InferProps<Schema extends $ZodObject, Props extends Record<string, unknown>> = $ZodObject extends Schema ? {} extends Props ? Record<string, unknown> : Props : {} extends Props ? z.input<Schema> : z.input<Schema> & Props;
export type DefaultPropsIfHasProps<Schema extends $ZodObject, Props> = $ZodObject extends Schema ? {} extends Props ? {
    defaultProps?: z.input<Schema> & Props;
} : {
    defaultProps: Props;
} : {} extends Props ? {
    defaultProps: z.input<Schema>;
} : {
    defaultProps: z.input<Schema> & Props;
};
type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);
type OptionalDimensions<Schema extends $ZodObject, Props extends Record<string, unknown>> = {
    component: LooseComponentType<Props>;
    id: string;
    width?: number;
    height?: number;
    calculateMetadata: CalculateMetadataFunction<InferProps<Schema, Props>>;
};
type MandatoryDimensions<Schema extends $ZodObject, Props extends Record<string, unknown>> = {
    component: LooseComponentType<Props>;
    id: string;
    width: number;
    height: number;
    calculateMetadata?: CalculateMetadataFunction<InferProps<Schema, Props>> | null;
};
export type CompositionCalculateMetadataOrExplicit<Schema extends $ZodObject, Props extends Record<string, unknown>> = ((OptionalDimensions<Schema, Props> & {
    fps?: number;
    durationInFrames?: number;
}) | (MandatoryDimensions<Schema, Props> & {
    fps: number;
    durationInFrames: number;
})) & DefaultPropsIfHasProps<Schema, Props>;
export {};
