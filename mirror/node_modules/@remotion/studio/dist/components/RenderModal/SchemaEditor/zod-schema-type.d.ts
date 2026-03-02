/**
 * Normalizes zod schema type detection across v3 and v4.
 *
 * v3 schemas have `_def.typeName` (e.g. "ZodString")
 * v4 schemas have `_def.type` (e.g. "string") and `_zod` property
 *
 * This module provides a unified type name using v4-style lowercase strings,
 * and accessor helpers that abstract v3/v4 `_def` property differences.
 */
/**
 * Structural type for any Zod schema (v3 or v4).
 *
 * v3 schemas have `_def` with `typeName` property.
 * v4 classic schemas have `_def` with `type` property.
 * v4 core schemas have `_zod.def` with `type` property.
 * At runtime, all zod schemas have `_def` (classic layer adds it for v4).
 */
export interface ZodValidationError {
    format(): {
        _errors: string[];
    };
    issues: readonly {
        code: string;
        message: string;
        path: readonly PropertyKey[];
    }[];
}
export type ZodSafeParseResult = {
    success: true;
    data: unknown;
} | {
    success: false;
    error: ZodValidationError;
};
export interface AnyZodSchema {
    readonly _def?: Record<string, any>;
    readonly _zod?: {
        def: Record<string, any>;
        [key: string]: any;
    };
    readonly description?: string;
}
/**
 * Call safeParse on any Zod schema (v3 or v4).
 * All Zod schemas have safeParse at runtime, but some v4 internal types
 * (like $ZodObject) don't declare it in their type definition.
 */
export declare const zodSafeParse: (schema: AnyZodSchema, data: unknown) => ZodSafeParseResult;
export declare const getZodDef: (schema: AnyZodSchema) => Record<string, any>;
export type ZodSchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'union' | 'discriminatedUnion' | 'optional' | 'nullable' | 'default' | 'tuple' | 'date' | 'any' | 'unknown' | 'bigint' | 'null' | 'undefined' | 'effects' | 'literal' | 'record' | 'never' | (string & {});
export declare const isZodV3Schema: (schema: AnyZodSchema) => boolean;
/**
 * Get the normalized type name for a zod schema (v3 or v4).
 *
 * In v4, discriminatedUnion is a union with a `discriminator` property on `_def`.
 * This function returns 'discriminatedUnion' for that case.
 */
export declare const getZodSchemaType: (schema: AnyZodSchema) => ZodSchemaType;
/**
 * Get the description of a schema, handling v3 vs v4 differences.
 *
 * v3: _def.description
 * v4: schema.description
 */
export declare const getZodSchemaDescription: (schema: AnyZodSchema) => string | undefined;
/**
 * Get the shape of an object schema.
 * v3: _def.shape() (function)
 * v4: _def.shape (plain object)
 */
export declare const getObjectShape: (schema: AnyZodSchema) => Record<string, AnyZodSchema>;
/**
 * Get the element schema of an array.
 * v3: _def.type
 * v4: _def.element
 */
export declare const getArrayElement: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the inner type for wrappers like optional, nullable, default, catch.
 * Both v3 and v4 use _def.innerType.
 */
export declare const getInnerType: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the inner schema for effects (v3 only - v4 doesn't wrap).
 * v3: _def.schema
 */
export declare const getEffectsInner: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the literal value.
 * v3: _def.value (single value)
 * v4: _def.values (array of values) - take the first
 */
export declare const getLiteralValue: (schema: AnyZodSchema) => unknown;
/**
 * Get enum values as an array of strings.
 * v3: _def.values (string[])
 * v4: _def.entries (Record<string,string>) - convert to values array
 */
export declare const getEnumValues: (schema: AnyZodSchema) => string[];
/**
 * Get the first valid value from an enum schema.
 * Handles both regular enums and nativeEnums.
 *
 * In v4, nativeEnums are represented as regular enums with bidirectional
 * entries (e.g. { Apple: 0, "0": "Apple" }). This function filters out
 * the reverse mappings to return actual enum values.
 */
export declare const getFirstEnumValue: (schema: AnyZodSchema) => unknown;
/**
 * Get the union/discriminatedUnion options array.
 * Both v3 and v4 use _def.options.
 */
export declare const getUnionOptions: (schema: AnyZodSchema) => AnyZodSchema[];
/**
 * Get the default value from a ZodDefault.
 * v3: _def.defaultValue() (function)
 * v4: _def.defaultValue (plain value)
 */
export declare const getDefaultValue: (schema: AnyZodSchema) => unknown;
/**
 * Get the discriminator key from a discriminated union.
 * v3: _def.discriminator
 * v4: _def.discriminator
 */
export declare const getDiscriminator: (schema: AnyZodSchema) => string;
/**
 * Get all discriminator option keys from a discriminated union.
 * v3: [..._def.optionsMap.keys()]
 * v4: iterate options and extract literal values from discriminator field
 */
export declare const getDiscriminatedOptionKeys: (schema: AnyZodSchema) => string[];
/**
 * Get the option schema matching a discriminator value.
 * v3: _def.optionsMap.get(value)
 * v4: find matching option by inspecting literal values
 */
export declare const getDiscriminatedOption: (schema: AnyZodSchema, discriminatorValue: string) => AnyZodSchema | undefined;
/**
 * Get the left and right schemas from an intersection.
 * Both v3 and v4 use _def.left and _def.right.
 */
export declare const getIntersectionSchemas: (schema: AnyZodSchema) => {
    left: AnyZodSchema;
    right: AnyZodSchema;
};
/**
 * Get the items array from a tuple schema.
 * Both v3 and v4 use _def.items.
 */
export declare const getTupleItems: (schema: AnyZodSchema) => AnyZodSchema[];
/**
 * Get the value type schema from a record.
 * Both v3 and v4 use _def.valueType.
 */
export declare const getRecordValueType: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the key type schema from a record.
 * Both v3 and v4 use _def.keyType.
 */
export declare const getRecordKeyType: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the output schema from a pipeline/pipe.
 * Both v3 and v4 use _def.out.
 */
export declare const getPipelineOutput: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the input schema from a pipeline/pipe.
 * Both v3 and v4 use _def.in.
 */
export declare const getPipelineInput: (schema: AnyZodSchema) => AnyZodSchema;
/**
 * Get the inner schema from a branded type.
 * v3: _def.type
 * v4: branded is the schema itself (branding is type-level only)
 */
export declare const getBrandedInner: (schema: AnyZodSchema) => AnyZodSchema;
