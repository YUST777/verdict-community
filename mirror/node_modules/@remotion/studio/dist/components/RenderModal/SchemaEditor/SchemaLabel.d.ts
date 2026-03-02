import React from 'react';
import type { JSONPath } from './zod-types';
export declare const SchemaLabel: React.FC<{
    readonly jsonPath: JSONPath;
    readonly isDefaultValue: boolean;
    readonly onReset: () => void;
    readonly onSave: () => void;
    readonly onRemove: null | (() => void);
    readonly showSaveButton: boolean;
    readonly saving: boolean;
    readonly valid: boolean;
    readonly saveDisabledByParent: boolean;
    readonly suffix: string | null;
    readonly handleClick: null | (() => void);
}>;
