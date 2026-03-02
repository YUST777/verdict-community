import React from 'react';
import type { AnyZodSchema } from './zod-schema-type';
import type { JSONPath } from './zod-types';
import type { UpdaterFunction } from './ZodSwitch';
export declare const ZodDefaultEditor: React.FC<{
    readonly showSaveButton: boolean;
    readonly jsonPath: JSONPath;
    readonly value: unknown;
    readonly defaultValue: unknown;
    readonly schema: AnyZodSchema;
    readonly setValue: UpdaterFunction<unknown>;
    readonly onSave: UpdaterFunction<unknown>;
    readonly onRemove: null | (() => void);
    readonly saving: boolean;
    readonly saveDisabledByParent: boolean;
    readonly mayPad: boolean;
}>;
