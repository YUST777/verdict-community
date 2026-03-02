"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEnumJsonPaths = void 0;
const zod_schema_type_1 = require("./zod-schema-type");
const extractEnumJsonPaths = ({ schema, zodRuntime, currentPath, zodTypes, }) => {
    // In v4, .refine()/.describe() don't wrap in effects — the description
    // lives directly on the schema. Check for branded descriptions early
    // so they are detected regardless of the underlying type.
    const description = (0, zod_schema_type_1.getZodSchemaDescription)(schema);
    if (zodTypes &&
        description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
        return [currentPath];
    }
    const typeName = (0, zod_schema_type_1.getZodSchemaType)(schema);
    switch (typeName) {
        case 'object': {
            const shape = (0, zod_schema_type_1.getObjectShape)(schema);
            const keys = Object.keys(shape);
            return keys
                .map((key) => {
                return (0, exports.extractEnumJsonPaths)({
                    schema: shape[key],
                    zodRuntime,
                    currentPath: [...currentPath, key],
                    zodTypes,
                });
            })
                .flat(1);
        }
        case 'array': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getArrayElement)(schema),
                zodRuntime,
                currentPath: [...currentPath, '[]'],
                zodTypes,
            });
        }
        case 'union': {
            return (0, zod_schema_type_1.getUnionOptions)(schema)
                .map((option) => {
                return (0, exports.extractEnumJsonPaths)({
                    schema: option,
                    zodRuntime,
                    currentPath,
                    zodTypes,
                });
            })
                .flat(1);
        }
        case 'discriminatedUnion': {
            return (0, zod_schema_type_1.getUnionOptions)(schema)
                .map((op) => {
                return (0, exports.extractEnumJsonPaths)({
                    schema: op,
                    zodRuntime,
                    currentPath,
                    zodTypes,
                });
            })
                .flat(1);
        }
        case 'literal': {
            return [currentPath];
        }
        case 'effects': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getEffectsInner)(schema),
                zodRuntime,
                currentPath,
                zodTypes,
            });
        }
        case 'intersection': {
            const { left, right } = (0, zod_schema_type_1.getIntersectionSchemas)(schema);
            const leftValue = (0, exports.extractEnumJsonPaths)({
                schema: left,
                zodRuntime,
                currentPath,
                zodTypes,
            });
            const rightValue = (0, exports.extractEnumJsonPaths)({
                schema: right,
                zodRuntime,
                currentPath,
                zodTypes,
            });
            return [...leftValue, ...rightValue];
        }
        case 'tuple': {
            return (0, zod_schema_type_1.getTupleItems)(schema)
                .map((item, i) => (0, exports.extractEnumJsonPaths)({
                schema: item,
                zodRuntime,
                currentPath: [...currentPath, i],
                zodTypes,
            }))
                .flat(1);
        }
        case 'record': {
            const recordPath = [...currentPath, '{}'];
            const keyResults = (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getRecordKeyType)(schema),
                zodRuntime,
                currentPath: recordPath,
                zodTypes,
            });
            const valueResults = (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getRecordValueType)(schema),
                zodRuntime,
                currentPath: recordPath,
                zodTypes,
            });
            return [...keyResults, ...valueResults];
        }
        case 'function': {
            throw new Error('Cannot create a value for type function');
        }
        case 'enum': {
            return [currentPath];
        }
        case 'nativeEnum': {
            return [];
        }
        case 'optional':
        case 'nullable':
        case 'catch': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getInnerType)(schema),
                zodRuntime,
                currentPath,
                zodTypes,
            });
        }
        case 'default': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getInnerType)(schema),
                zodRuntime,
                currentPath,
                zodTypes,
            });
        }
        case 'promise': {
            return [];
        }
        case 'branded': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getBrandedInner)(schema),
                zodRuntime,
                currentPath,
                zodTypes,
            });
        }
        case 'pipeline':
        case 'pipe': {
            return (0, exports.extractEnumJsonPaths)({
                schema: (0, zod_schema_type_1.getPipelineOutput)(schema),
                zodRuntime,
                currentPath,
                zodTypes,
            });
        }
        case 'string':
        case 'number':
        case 'bigint':
        case 'boolean':
        case 'nan':
        case 'date':
        case 'symbol':
        case 'undefined':
        case 'null':
        case 'any':
        case 'unknown':
        case 'never':
        case 'void':
        case 'map':
        case 'lazy':
        case 'set':
        case 'custom': {
            return [];
        }
        default:
            throw new Error('Not implemented: ' + typeName);
    }
};
exports.extractEnumJsonPaths = extractEnumJsonPaths;
