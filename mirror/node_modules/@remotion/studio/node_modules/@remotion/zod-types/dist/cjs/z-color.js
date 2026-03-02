"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zColor = exports.parseColor = exports.REMOTION_COLOR_BRAND = void 0;
const no_react_1 = require("remotion/no-react");
const zod_1 = require("zod");
exports.REMOTION_COLOR_BRAND = '__remotion-color';
const parseColor = (value) => {
    const colored = no_react_1.NoReactInternals.processColor(value)
        .toString(16)
        .padStart(8, '0');
    const opacity = parseInt(colored.slice(0, 2), 16);
    const r = parseInt(colored.slice(2, 4), 16);
    const g = parseInt(colored.slice(4, 6), 16);
    const b = parseInt(colored.slice(6, 8), 16);
    return { a: opacity, r, g, b };
};
exports.parseColor = parseColor;
const zColor = () => zod_1.z
    .string()
    .refine((value) => {
    try {
        (0, exports.parseColor)(value);
        return true;
    }
    catch (_a) {
        return false;
    }
}, { message: 'Invalid color' })
    .describe(exports.REMOTION_COLOR_BRAND);
exports.zColor = zColor;
