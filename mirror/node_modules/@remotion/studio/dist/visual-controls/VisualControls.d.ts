import React from 'react';
import type { AnyZodSchema } from '../components/RenderModal/SchemaEditor/zod-schema-type';
export type VisualControlValueWithoutUnsaved = {
    valueInCode: unknown;
    schema: AnyZodSchema;
    stack: string;
};
export type VisualControlValue = VisualControlValueWithoutUnsaved & {
    unsavedValue: unknown;
};
export type Handles = Record<string, VisualControlValue>;
export type VisualControlsContextType = {
    handles: Handles;
};
export declare const VisualControlsTabActivatedContext: React.Context<boolean>;
export type SetVisualControlsContextType = {
    updateHandles: () => void;
    updateValue: (key: string, value: unknown) => void;
    visualControl: <T>(key: string, value: T, schema?: AnyZodSchema) => T;
};
export declare const VisualControlsContext: React.Context<VisualControlsContextType>;
export type VisualControlRef = {
    globalVisualControl: <T>(key: string, value: T, schema?: AnyZodSchema) => T;
};
export declare const visualControlRef: React.RefObject<VisualControlRef | null>;
export declare const SetVisualControlsContext: React.Context<SetVisualControlsContextType>;
export declare const VisualControlsProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
