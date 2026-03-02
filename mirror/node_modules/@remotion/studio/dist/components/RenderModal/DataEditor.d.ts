import React from 'react';
import type { _InternalTypes } from 'remotion';
import type { ZodSafeParseResult } from './SchemaEditor/zod-schema-type';
export type State = {
    str: string;
    value: Record<string, unknown>;
    validJSON: true;
    zodValidation: ZodSafeParseResult;
} | {
    str: string;
    validJSON: false;
    error: string;
};
export type PropsEditType = 'input-props' | 'default-props';
export declare const DataEditor: React.FC<{
    readonly unresolvedComposition: _InternalTypes['AnyComposition'];
    readonly defaultProps: Record<string, unknown>;
    readonly setDefaultProps: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    readonly mayShowSaveButton: boolean;
    readonly propsEditType: PropsEditType;
    readonly saving: boolean;
    readonly setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    readonly readOnlyStudio: boolean;
}>;
