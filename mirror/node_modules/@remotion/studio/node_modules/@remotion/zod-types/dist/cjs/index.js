"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodZypesInternals = exports.zTextarea = exports.zMatrix = exports.zColor = void 0;
const z_color_js_1 = require("./z-color.js");
const z_matrix_js_1 = require("./z-matrix.js");
const z_textarea_1 = require("./z-textarea");
const z_color_js_2 = require("./z-color.js");
Object.defineProperty(exports, "zColor", { enumerable: true, get: function () { return z_color_js_2.zColor; } });
const z_matrix_js_2 = require("./z-matrix.js");
Object.defineProperty(exports, "zMatrix", { enumerable: true, get: function () { return z_matrix_js_2.zMatrix; } });
const z_textarea_js_1 = require("./z-textarea.js");
Object.defineProperty(exports, "zTextarea", { enumerable: true, get: function () { return z_textarea_js_1.zTextarea; } });
exports.ZodZypesInternals = {
    parseColor: z_color_js_1.parseColor,
    REMOTION_COLOR_BRAND: z_color_js_1.REMOTION_COLOR_BRAND,
    REMOTION_TEXTAREA_BRAND: z_textarea_1.REMOTION_TEXTAREA_BRAND,
    REMOTION_MATRIX_BRAND: z_matrix_js_1.REMOTION_MATRIX_BRAND,
};
