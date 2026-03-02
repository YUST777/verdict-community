import React from 'react';
import type { JSONPath } from './zod-types';
export declare const ZonNonEditableValue: React.FC<{
    readonly jsonPath: JSONPath;
    readonly label: string;
    readonly showSaveButton: boolean;
    readonly saving: boolean;
    readonly mayPad: boolean;
}>;
