"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zMatrix = exports.REMOTION_MATRIX_BRAND = void 0;
const zod_1 = require("zod");
exports.REMOTION_MATRIX_BRAND = '__remotion-matrix';
const zMatrix = () => zod_1.z
    .array(zod_1.z.number().step(0.01))
    .refine((value) => {
    const count = value.length;
    const root = Math.sqrt(count);
    return Number.isInteger(root) && root > 0;
}, { message: 'Invalid matrix, must be a square matrix' })
    .describe(exports.REMOTION_MATRIX_BRAND);
exports.zMatrix = zMatrix;
