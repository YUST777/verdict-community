import React from 'react';
import type { AnyZodSchema } from './zod-schema-type';
export declare const VERTICAL_GUIDE_HEIGHT = 24;
export declare const SchemaSeparationLine: React.FC;
export declare const SchemaArrayItemSeparationLine: React.FC<{
    readonly onChange: (updater: (oldV: unknown[]) => unknown[], forceApply: boolean, increment: boolean) => void;
    readonly index: number;
    readonly schema: AnyZodSchema;
    readonly showAddButton: boolean;
    readonly isLast: boolean;
}>;
