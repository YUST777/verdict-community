"use strict";
/**
 * Normalizes zod schema type detection across v3 and v4.
 *
 * v3 schemas have `_def.typeName` (e.g. "ZodString")
 * v4 schemas have `_def.type` (e.g. "string") and `_zod` property
 *
 * This module provides a unified type name using v4-style lowercase strings,
 * and accessor helpers that abstract v3/v4 `_def` property differences.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandedInner = exports.getPipelineInput = exports.getPipelineOutput = exports.getRecordKeyType = exports.getRecordValueType = exports.getTupleItems = exports.getIntersectionSchemas = exports.getDiscriminatedOption = exports.getDiscriminatedOptionKeys = exports.getDiscriminator = exports.getDefaultValue = exports.getUnionOptions = exports.getFirstEnumValue = exports.getEnumValues = exports.getLiteralValue = exports.getEffectsInner = exports.getInnerType = exports.getArrayElement = exports.getObjectShape = exports.getZodSchemaDescription = exports.getZodSchemaType = exports.isZodV3Schema = exports.getZodDef = exports.zodSafeParse = void 0;
/**
 * Call safeParse on any Zod schema (v3 or v4).
 * All Zod schemas have safeParse at runtime, but some v4 internal types
 * (like $ZodObject) don't declare it in their type definition.
 */
const zodSafeParse = (schema, data) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return schema.safeParse(data);
};
exports.zodSafeParse = zodSafeParse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getZodDef = (schema) => {
    if (schema._def)
        return schema._def;
    if (schema._zod)
        return schema._zod.def;
    throw new Error('Invalid zod schema: missing _def and _zod');
};
exports.getZodDef = getZodDef;
const v3TypeNameMap = {
    ZodString: 'string',
    ZodNumber: 'number',
    ZodBoolean: 'boolean',
    ZodObject: 'object',
    ZodArray: 'array',
    ZodEnum: 'enum',
    ZodUnion: 'union',
    ZodDiscriminatedUnion: 'discriminatedUnion',
    ZodOptional: 'optional',
    ZodNullable: 'nullable',
    ZodDefault: 'default',
    ZodTuple: 'tuple',
    ZodDate: 'date',
    ZodAny: 'any',
    ZodUnknown: 'unknown',
    ZodBigInt: 'bigint',
    ZodNull: 'null',
    ZodUndefined: 'undefined',
    ZodEffects: 'effects',
    ZodLiteral: 'literal',
    ZodRecord: 'record',
    ZodNever: 'never',
    ZodVoid: 'void',
    ZodNaN: 'nan',
    ZodSymbol: 'symbol',
    ZodIntersection: 'intersection',
    ZodMap: 'map',
    ZodSet: 'set',
    ZodLazy: 'lazy',
    ZodFunction: 'function',
    ZodNativeEnum: 'nativeEnum',
    ZodCatch: 'catch',
    ZodPromise: 'promise',
    ZodBranded: 'branded',
    ZodPipeline: 'pipeline',
};
const isZodV3Schema = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    return 'typeName' in def;
};
exports.isZodV3Schema = isZodV3Schema;
/**
 * Get the normalized type name for a zod schema (v3 or v4).
 *
 * In v4, discriminatedUnion is a union with a `discriminator` property on `_def`.
 * This function returns 'discriminatedUnion' for that case.
 */
const getZodSchemaType = (schema) => {
    var _a;
    const def = (0, exports.getZodDef)(schema);
    if ('typeName' in def) {
        const { typeName } = def;
        return (_a = v3TypeNameMap[typeName]) !== null && _a !== void 0 ? _a : typeName;
    }
    // v4 schema: def.type is a string like "string", "number", etc.
    const { type } = def;
    // In v4, discriminatedUnion has def.type === "union" with def.discriminator
    if (type === 'union' && def.discriminator !== undefined) {
        return 'discriminatedUnion';
    }
    return type;
};
exports.getZodSchemaType = getZodSchemaType;
/**
 * Get the description of a schema, handling v3 vs v4 differences.
 *
 * v3: _def.description
 * v4: schema.description
 */
const getZodSchemaDescription = (schema) => {
    if ((0, exports.isZodV3Schema)(schema)) {
        return (0, exports.getZodDef)(schema).description;
    }
    return schema.description;
};
exports.getZodSchemaDescription = getZodSchemaDescription;
/**
 * Get the shape of an object schema.
 * v3: _def.shape() (function)
 * v4: _def.shape (plain object)
 */
const getObjectShape = (schema) => {
    const { shape } = (0, exports.getZodDef)(schema);
    return typeof shape === 'function' ? shape() : shape;
};
exports.getObjectShape = getObjectShape;
/**
 * Get the element schema of an array.
 * v3: _def.type
 * v4: _def.element
 */
const getArrayElement = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    return (0, exports.isZodV3Schema)(schema) ? def.type : def.element;
};
exports.getArrayElement = getArrayElement;
/**
 * Get the inner type for wrappers like optional, nullable, default, catch.
 * Both v3 and v4 use _def.innerType.
 */
const getInnerType = (schema) => {
    return (0, exports.getZodDef)(schema).innerType;
};
exports.getInnerType = getInnerType;
/**
 * Get the inner schema for effects (v3 only - v4 doesn't wrap).
 * v3: _def.schema
 */
const getEffectsInner = (schema) => {
    return (0, exports.getZodDef)(schema).schema;
};
exports.getEffectsInner = getEffectsInner;
/**
 * Get the literal value.
 * v3: _def.value (single value)
 * v4: _def.values (array of values) - take the first
 */
const getLiteralValue = (schema) => {
    var _a;
    const def = (0, exports.getZodDef)(schema);
    if ((0, exports.isZodV3Schema)(schema)) {
        return def.value;
    }
    return (_a = def.values) === null || _a === void 0 ? void 0 : _a[0];
};
exports.getLiteralValue = getLiteralValue;
/**
 * Get enum values as an array of strings.
 * v3: _def.values (string[])
 * v4: _def.entries (Record<string,string>) - convert to values array
 */
const getEnumValues = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    if ((0, exports.isZodV3Schema)(schema)) {
        return def.values;
    }
    const { entries } = def;
    return Object.values(entries);
};
exports.getEnumValues = getEnumValues;
/**
 * Get the first valid value from an enum schema.
 * Handles both regular enums and nativeEnums.
 *
 * In v4, nativeEnums are represented as regular enums with bidirectional
 * entries (e.g. { Apple: 0, "0": "Apple" }). This function filters out
 * the reverse mappings to return actual enum values.
 */
const getFirstEnumValue = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    if ((0, exports.isZodV3Schema)(schema)) {
        if (def.typeName === 'ZodNativeEnum') {
            const vals = Object.values(def.values);
            return vals[0];
        }
        return def.values[0];
    }
    const { entries } = def;
    const pairs = Object.entries(entries);
    // Check for native enum with bidirectional mapping
    const hasReverseMapping = pairs.some(([key, value]) => key !== String(value));
    if (hasReverseMapping) {
        // For numeric native enums, filter out the numeric-key reverse mappings
        const forwardPairs = pairs.filter(([key]) => Number.isNaN(Number(key)));
        if (forwardPairs.length > 0) {
            return forwardPairs[0][1];
        }
    }
    return Object.values(entries)[0];
};
exports.getFirstEnumValue = getFirstEnumValue;
/**
 * Get the union/discriminatedUnion options array.
 * Both v3 and v4 use _def.options.
 */
const getUnionOptions = (schema) => {
    return (0, exports.getZodDef)(schema).options;
};
exports.getUnionOptions = getUnionOptions;
/**
 * Get the default value from a ZodDefault.
 * v3: _def.defaultValue() (function)
 * v4: _def.defaultValue (plain value)
 */
const getDefaultValue = (schema) => {
    const dv = (0, exports.getZodDef)(schema).defaultValue;
    return typeof dv === 'function' ? dv() : dv;
};
exports.getDefaultValue = getDefaultValue;
/**
 * Get the discriminator key from a discriminated union.
 * v3: _def.discriminator
 * v4: _def.discriminator
 */
const getDiscriminator = (schema) => {
    return (0, exports.getZodDef)(schema).discriminator;
};
exports.getDiscriminator = getDiscriminator;
/**
 * Get all discriminator option keys from a discriminated union.
 * v3: [..._def.optionsMap.keys()]
 * v4: iterate options and extract literal values from discriminator field
 */
const getDiscriminatedOptionKeys = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    const discriminator = (0, exports.getDiscriminator)(schema);
    // v3 has optionsMap
    if ((0, exports.isZodV3Schema)(schema) && def.optionsMap) {
        return [...def.optionsMap.keys()];
    }
    // v4: iterate options
    const options = (0, exports.getUnionOptions)(schema);
    return options.map((option) => {
        const shape = (0, exports.getObjectShape)(option);
        const discriminatorSchema = shape[discriminator];
        return (0, exports.getLiteralValue)(discriminatorSchema);
    });
};
exports.getDiscriminatedOptionKeys = getDiscriminatedOptionKeys;
/**
 * Get the option schema matching a discriminator value.
 * v3: _def.optionsMap.get(value)
 * v4: find matching option by inspecting literal values
 */
const getDiscriminatedOption = (schema, discriminatorValue) => {
    const def = (0, exports.getZodDef)(schema);
    const discriminator = (0, exports.getDiscriminator)(schema);
    // v3 has optionsMap
    if ((0, exports.isZodV3Schema)(schema) && def.optionsMap) {
        return def.optionsMap.get(discriminatorValue);
    }
    // v4: iterate options
    const options = (0, exports.getUnionOptions)(schema);
    return options.find((option) => {
        const shape = (0, exports.getObjectShape)(option);
        const discriminatorSchema = shape[discriminator];
        return (0, exports.getLiteralValue)(discriminatorSchema) === discriminatorValue;
    });
};
exports.getDiscriminatedOption = getDiscriminatedOption;
/**
 * Get the left and right schemas from an intersection.
 * Both v3 and v4 use _def.left and _def.right.
 */
const getIntersectionSchemas = (schema) => {
    const def = (0, exports.getZodDef)(schema);
    return { left: def.left, right: def.right };
};
exports.getIntersectionSchemas = getIntersectionSchemas;
/**
 * Get the items array from a tuple schema.
 * Both v3 and v4 use _def.items.
 */
const getTupleItems = (schema) => {
    return (0, exports.getZodDef)(schema).items;
};
exports.getTupleItems = getTupleItems;
/**
 * Get the value type schema from a record.
 * Both v3 and v4 use _def.valueType.
 */
const getRecordValueType = (schema) => {
    return (0, exports.getZodDef)(schema).valueType;
};
exports.getRecordValueType = getRecordValueType;
/**
 * Get the key type schema from a record.
 * Both v3 and v4 use _def.keyType.
 */
const getRecordKeyType = (schema) => {
    return (0, exports.getZodDef)(schema).keyType;
};
exports.getRecordKeyType = getRecordKeyType;
/**
 * Get the output schema from a pipeline/pipe.
 * Both v3 and v4 use _def.out.
 */
const getPipelineOutput = (schema) => {
    return (0, exports.getZodDef)(schema).out;
};
exports.getPipelineOutput = getPipelineOutput;
/**
 * Get the input schema from a pipeline/pipe.
 * Both v3 and v4 use _def.in.
 */
const getPipelineInput = (schema) => {
    return (0, exports.getZodDef)(schema).in;
};
exports.getPipelineInput = getPipelineInput;
/**
 * Get the inner schema from a branded type.
 * v3: _def.type
 * v4: branded is the schema itself (branding is type-level only)
 */
const getBrandedInner = (schema) => {
    return (0, exports.isZodV3Schema)(schema) ? (0, exports.getZodDef)(schema).type : schema;
};
exports.getBrandedInner = getBrandedInner;
