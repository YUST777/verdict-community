import React from 'react';
import type { AnyZodSchema } from './zod-schema-type';
import type { JSONPath } from './zod-types';
export type UpdaterFunction<T> = (updater: (oldValue: T) => T, forceApply: boolean, increment: boolean) => void;
export declare const ZodSwitch: React.FC<{
    readonly schema: AnyZodSchema;
    readonly jsonPath: JSONPath;
    readonly value: unknown;
    readonly defaultValue: unknown;
    readonly setValue: UpdaterFunction<unknown>;
    readonly onSave: UpdaterFunction<unknown>;
    readonly showSaveButton: boolean;
    readonly onRemove: null | (() => void);
    readonly saving: boolean;
    readonly saveDisabledByParent: boolean;
    readonly mayPad: boolean;
}>;
