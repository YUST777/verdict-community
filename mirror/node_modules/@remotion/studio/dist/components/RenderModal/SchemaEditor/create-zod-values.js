"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZodValues = void 0;
const zod_schema_type_1 = require("./zod-schema-type");
const createZodValues = (schema, zodRuntime, zodTypes) => {
    var _a;
    if (!schema) {
        throw new Error('Invalid zod schema');
    }
    // In v4, .refine()/.describe() don't wrap in effects — the description
    // lives directly on the schema. Check for branded descriptions early
    // so they are detected regardless of the underlying type.
    const description = (0, zod_schema_type_1.getZodSchemaDescription)(schema);
    if (zodTypes) {
        if (description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND) {
            return '#ffffff';
        }
        if (description === zodTypes.ZodZypesInternals.REMOTION_TEXTAREA_BRAND) {
            return '';
        }
        if (description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
            return [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ];
        }
    }
    const typeName = (0, zod_schema_type_1.getZodSchemaType)(schema);
    switch (typeName) {
        case 'string':
            return '';
        case 'number': {
            const { checks } = (0, zod_schema_type_1.getZodDef)(schema);
            if (checks) {
                if ((0, zod_schema_type_1.isZodV3Schema)(schema)) {
                    for (const check of checks) {
                        if (check.kind === 'min')
                            return check.value;
                        if (check.kind === 'max' && check.value < 0)
                            return check.value;
                    }
                }
                else {
                    for (const check of checks) {
                        const cd = (_a = check._zod) === null || _a === void 0 ? void 0 : _a.def;
                        if ((cd === null || cd === void 0 ? void 0 : cd.check) === 'greater_than')
                            return cd.value;
                        if ((cd === null || cd === void 0 ? void 0 : cd.check) === 'less_than' && cd.value < 0)
                            return cd.value;
                    }
                }
            }
            return 0;
        }
        case 'bigint':
            return BigInt(0);
        case 'boolean':
            return false;
        case 'nan':
            return NaN;
        case 'date':
            return new Date();
        case 'symbol':
            return Symbol('remotion');
        case 'undefined':
        case 'void':
            return undefined;
        case 'null':
            return null;
        case 'any':
        case 'custom':
            throw new Error('Cannot create a value for type z.any()');
        case 'unknown':
            throw new Error('Cannot create a value for type z.unknown()');
        case 'never':
            throw new Error('Cannot create a value for type z.never()');
        case 'object': {
            const shape = (0, zod_schema_type_1.getObjectShape)(schema);
            const keys = Object.keys(shape);
            const returnValue = keys.reduce((existing, key) => {
                existing[key] = (0, exports.createZodValues)(shape[key], zodRuntime, zodTypes);
                return existing;
            }, {});
            return returnValue;
        }
        case 'array': {
            return [(0, exports.createZodValues)((0, zod_schema_type_1.getArrayElement)(schema), zodRuntime, zodTypes)];
        }
        case 'union': {
            const firstOption = (0, zod_schema_type_1.getUnionOptions)(schema)[0];
            return firstOption
                ? (0, exports.createZodValues)(firstOption, zodRuntime, zodTypes)
                : undefined;
        }
        case 'discriminatedUnion': {
            const firstOption = (0, zod_schema_type_1.getUnionOptions)(schema)[0];
            return (0, exports.createZodValues)(firstOption, zodRuntime, zodTypes);
        }
        case 'literal': {
            return (0, zod_schema_type_1.getLiteralValue)(schema);
        }
        case 'effects': {
            return (0, exports.createZodValues)((0, zod_schema_type_1.getEffectsInner)(schema), zodRuntime, zodTypes);
        }
        case 'intersection': {
            const { left, right } = (0, zod_schema_type_1.getIntersectionSchemas)(schema);
            const leftValue = (0, exports.createZodValues)(left, zodRuntime, zodTypes);
            if (typeof leftValue !== 'object') {
                throw new Error('Cannot create value for type z.intersection: Left side is not an object');
            }
            const rightValue = (0, exports.createZodValues)(right, zodRuntime, zodTypes);
            if (typeof rightValue !== 'object') {
                throw new Error('Cannot create value for type z.intersection: Right side is not an object');
            }
            return { ...leftValue, ...rightValue };
        }
        case 'tuple': {
            return (0, zod_schema_type_1.getTupleItems)(schema).map((item) => (0, exports.createZodValues)(item, zodRuntime, zodTypes));
        }
        case 'record': {
            const values = (0, exports.createZodValues)((0, zod_schema_type_1.getRecordValueType)(schema), zodRuntime, zodTypes);
            return { key: values };
        }
        case 'map': {
            const values = (0, exports.createZodValues)((0, zod_schema_type_1.getRecordValueType)(schema), zodRuntime, zodTypes);
            const key = (0, exports.createZodValues)((0, zod_schema_type_1.getRecordKeyType)(schema), zodRuntime, zodTypes);
            return new Map([[key, values]]);
        }
        case 'lazy': {
            const type = (0, zod_schema_type_1.getZodDef)(schema).getter();
            return (0, exports.createZodValues)(type, zodRuntime, zodTypes);
        }
        case 'set': {
            const values = (0, exports.createZodValues)((0, zod_schema_type_1.getZodDef)(schema).valueType, zodRuntime, zodTypes);
            return new Set([values]);
        }
        case 'function': {
            throw new Error('Cannot create a value for type function');
        }
        case 'enum': {
            return (0, zod_schema_type_1.getFirstEnumValue)(schema);
        }
        case 'nativeEnum': {
            return 0;
        }
        case 'optional':
        case 'nullable':
        case 'catch': {
            return (0, exports.createZodValues)((0, zod_schema_type_1.getInnerType)(schema), zodRuntime, zodTypes);
        }
        case 'default': {
            return (0, zod_schema_type_1.getDefaultValue)(schema);
        }
        case 'promise': {
            const def = (0, zod_schema_type_1.getZodDef)(schema);
            // v3: _def.type, v4: _def.innerType
            const inner = (0, zod_schema_type_1.isZodV3Schema)(schema) ? def.type : def.innerType;
            const value = (0, exports.createZodValues)(inner, zodRuntime, zodTypes);
            return Promise.resolve(value);
        }
        case 'branded': {
            return (0, exports.createZodValues)((0, zod_schema_type_1.getBrandedInner)(schema), zodRuntime, zodTypes);
        }
        case 'pipeline':
        case 'pipe': {
            const out = (0, zod_schema_type_1.getPipelineOutput)(schema);
            // In v4, .transform() creates pipe { in, out: transform }.
            // Since we don't apply transforms, use the input side.
            if ((0, zod_schema_type_1.getZodSchemaType)(out) === 'transform') {
                return (0, exports.createZodValues)((0, zod_schema_type_1.getPipelineInput)(schema), zodRuntime, zodTypes);
            }
            return (0, exports.createZodValues)(out, zodRuntime, zodTypes);
        }
        default:
            throw new Error('Not implemented: ' + typeName);
    }
};
exports.createZodValues = createZodValues;
