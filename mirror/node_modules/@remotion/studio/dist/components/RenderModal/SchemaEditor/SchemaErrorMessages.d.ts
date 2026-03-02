import type { ZodSafeParseResult } from './zod-schema-type';
export declare const ZodNotInstalled: () => import("react/jsx-runtime").JSX.Element;
export declare const NoSchemaDefined: () => import("react/jsx-runtime").JSX.Element;
export declare const NoDefaultProps: () => import("react/jsx-runtime").JSX.Element;
export declare const InvalidDefaultProps: React.FC<{
    zodValidationResult: ZodSafeParseResult;
}>;
export declare const InvalidSchema: React.FC<{
    zodValidationResult: ZodSafeParseResult;
    reset: () => void;
}>;
export declare const TopLevelZodValue: React.FC<{
    typeReceived: string;
}>;
