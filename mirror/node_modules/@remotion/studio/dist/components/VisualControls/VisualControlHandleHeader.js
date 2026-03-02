"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualControlHandleHeader = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ClickableFileName_1 = require("./ClickableFileName");
const VisualControlHandleHeader = ({ originalFileName }) => {
    return jsx_runtime_1.jsx(ClickableFileName_1.ClickableFileName, { originalFileName: originalFileName });
};
exports.VisualControlHandleHeader = VisualControlHandleHeader;
