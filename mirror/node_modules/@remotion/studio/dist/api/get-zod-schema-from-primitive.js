"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZodSchemaFromPrimitive = getZodSchemaFromPrimitive;
function getZodSchemaFromPrimitive(value, z) {
    if (typeof value === 'string') {
        return z.string();
    }
    if (typeof value === 'number') {
        return z.number();
    }
    let stringified;
    try {
        stringified = JSON.stringify(value);
    }
    catch (_a) { }
    throw new Error(`visualControl(): Specify a schema for this value: ${stringified !== null && stringified !== void 0 ? stringified : '[non-serializable value]'}. See https://remotion.dev/docs/studio/visual-control`);
}
