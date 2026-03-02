"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshCompositionOverlay = exports.container = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const RunningCalculateMetadata_1 = require("./RunningCalculateMetadata");
exports.container = {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 20,
    pointerEvents: 'none',
};
const shadow = {
    boxShadow: '0 0 4px black',
};
const RefreshCompositionOverlay = () => {
    return (jsx_runtime_1.jsx(remotion_1.AbsoluteFill, { style: exports.container, children: jsx_runtime_1.jsx("div", { style: shadow, children: jsx_runtime_1.jsx(RunningCalculateMetadata_1.RunningCalculateMetadata, {}) }) }));
};
exports.RefreshCompositionOverlay = RefreshCompositionOverlay;
