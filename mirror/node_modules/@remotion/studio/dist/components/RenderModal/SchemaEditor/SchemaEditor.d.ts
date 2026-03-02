import React from 'react';
import type { AnyZodSchema, ZodSafeParseResult } from './zod-schema-type';
export declare const SchemaEditor: React.FC<{
    readonly schema: AnyZodSchema;
    readonly unsavedDefaultProps: Record<string, unknown>;
    readonly setValue: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    readonly zodValidationResult: ZodSafeParseResult;
    readonly savedDefaultProps: Record<string, unknown>;
    readonly onSave: (updater: (oldState: Record<string, unknown>) => Record<string, unknown>) => void;
    readonly showSaveButton: boolean;
    readonly saving: boolean;
    readonly saveDisabledByParent: boolean;
}>;
