"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStill = exports.createComposition = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const createComposition = ({ ...other }) => () => {
    // @ts-expect-error
    return jsx_runtime_1.jsx(remotion_1.Composition, { ...other });
};
exports.createComposition = createComposition;
const createStill = ({ ...other }) => () => {
    // @ts-expect-error
    return jsx_runtime_1.jsx(remotion_1.Still, { ...other });
};
exports.createStill = createStill;
