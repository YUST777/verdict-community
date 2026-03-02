import React from 'react';
import type { ZodSafeParseResult } from './zod-schema-type';
export declare const ZodErrorMessages: React.FC<{
    readonly zodValidationResult: ZodSafeParseResult;
    readonly viewTab: 'schema' | 'json';
}>;
