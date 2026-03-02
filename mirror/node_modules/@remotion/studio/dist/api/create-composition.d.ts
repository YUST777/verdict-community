import type { AnyZodObject, CompositionProps, StillProps } from 'remotion';
export declare const createComposition: <Schema extends AnyZodObject, Props extends Record<string, unknown>>({ ...other }: CompositionProps<Schema, Props>) => () => import("react/jsx-runtime").JSX.Element;
export declare const createStill: <Schema extends AnyZodObject, Props extends Record<string, unknown>>({ ...other }: StillProps<Schema, Props>) => () => import("react/jsx-runtime").JSX.Element;
