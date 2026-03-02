import { type AnyZodSchema } from './zod-schema-type';
export declare const extractEnumJsonPaths: ({ schema, zodRuntime, currentPath, zodTypes, }: {
    schema: AnyZodSchema;
    zodRuntime: unknown;
    zodTypes: typeof import("@remotion/zod-types") | null;
    currentPath: (string | number)[];
}) => (string | number)[][];
