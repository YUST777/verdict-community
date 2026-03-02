"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodNumberStep = exports.getZodNumberMaximum = exports.getZodNumberMinimum = void 0;
const zod_schema_type_1 = require("./zod-schema-type");
const getZodNumberMinimum = (schema) => {
    var _a;
    const { checks } = (0, zod_schema_type_1.getZodDef)(schema);
    if (!checks)
        return -Infinity;
    if ((0, zod_schema_type_1.isZodV3Schema)(schema)) {
        // v3: {kind: "min", value: 0, inclusive: true}
        const minCheck = checks.find((c) => c.kind === 'min');
        if (!minCheck || !minCheck.inclusive)
            return -Infinity;
        return minCheck.value;
    }
    // v4: check objects with _zod.def = {check: "greater_than", value: 0, inclusive: true}
    for (const c of checks) {
        const def = (_a = c._zod) === null || _a === void 0 ? void 0 : _a.def;
        if ((def === null || def === void 0 ? void 0 : def.check) === 'greater_than' && def.inclusive) {
            return def.value;
        }
    }
    return -Infinity;
};
exports.getZodNumberMinimum = getZodNumberMinimum;
const getZodNumberMaximum = (schema) => {
    var _a;
    const { checks } = (0, zod_schema_type_1.getZodDef)(schema);
    if (!checks)
        return Infinity;
    if ((0, zod_schema_type_1.isZodV3Schema)(schema)) {
        // v3: {kind: "max", value: 100, inclusive: true}
        const maxCheck = checks.find((c) => c.kind === 'max');
        if (!maxCheck || !maxCheck.inclusive)
            return Infinity;
        return maxCheck.value;
    }
    // v4: check objects with _zod.def = {check: "less_than", value: 100, inclusive: true}
    for (const c of checks) {
        const def = (_a = c._zod) === null || _a === void 0 ? void 0 : _a.def;
        if ((def === null || def === void 0 ? void 0 : def.check) === 'less_than' && def.inclusive) {
            return def.value;
        }
    }
    return Infinity;
};
exports.getZodNumberMaximum = getZodNumberMaximum;
const getZodNumberStep = (schema) => {
    var _a;
    const { checks } = (0, zod_schema_type_1.getZodDef)(schema);
    if (!checks)
        return undefined;
    if ((0, zod_schema_type_1.isZodV3Schema)(schema)) {
        // v3: {kind: "multipleOf", value: 5}
        const multipleStep = checks.find((c) => c.kind === 'multipleOf');
        if (!multipleStep)
            return undefined;
        return multipleStep.value;
    }
    // v4: check objects with _zod.def = {check: "multiple_of", value: 5}
    for (const c of checks) {
        const def = (_a = c._zod) === null || _a === void 0 ? void 0 : _a.def;
        if ((def === null || def === void 0 ? void 0 : def.check) === 'multiple_of') {
            return def.value;
        }
    }
    return undefined;
};
exports.getZodNumberStep = getZodNumberStep;
