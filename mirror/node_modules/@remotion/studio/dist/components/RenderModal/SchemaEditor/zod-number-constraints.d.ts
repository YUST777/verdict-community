import type { AnyZodSchema } from './zod-schema-type';
export declare const getZodNumberMinimum: (schema: AnyZodSchema) => number;
export declare const getZodNumberMaximum: (schema: AnyZodSchema) => number;
export declare const getZodNumberStep: (schema: AnyZodSchema) => number | undefined;
