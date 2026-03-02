import React from 'react';
export type ZodType = Awaited<typeof import('zod')>['z'];
export type ZodV3Type = Awaited<typeof import('zod/v3')>;
export type ZodTypesType = Awaited<typeof import('@remotion/zod-types')>;
export declare function getZodIfPossible(): Promise<ZodType | null>;
export declare const getZodV3IfPossible: () => Promise<typeof import("zod/v3") | null>;
export declare const getZTypesIfPossible: () => Promise<typeof import("@remotion/zod-types") | null>;
export declare function useZodIfPossible(): ZodType | null;
export declare const useZodV3IfPossible: () => typeof import("zod/v3") | null;
export declare const useZodTypesIfPossible: () => typeof import("@remotion/zod-types") | null;
export declare const ZodProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
