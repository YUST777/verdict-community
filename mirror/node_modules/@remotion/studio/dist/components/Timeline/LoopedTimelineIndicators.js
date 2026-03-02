"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopedTimelineIndicator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const remotion_1 = require("remotion");
const layout_1 = require("../layout");
const LoopedIndicator_1 = require("./LoopedIndicator");
const row = {
    flexDirection: 'row',
};
const LoopedTimelineIndicator = ({ loops }) => {
    const leftOver = loops % 1;
    return (jsx_runtime_1.jsxs(remotion_1.AbsoluteFill, { style: row, children: [new Array(Math.floor(loops)).fill(true).map((_l, i) => {
                return (jsx_runtime_1.jsxs(react_1.default.Fragment
                // eslint-disable-next-line
                , { children: [
                        jsx_runtime_1.jsx(layout_1.Flex, {}), i === loops - 1 ? null : jsx_runtime_1.jsx(LoopedIndicator_1.LoopedIndicator, {})] }, i));
            }), leftOver > 0 ? jsx_runtime_1.jsx("div", { style: { flex: leftOver } }) : null] }));
};
exports.LoopedTimelineIndicator = LoopedTimelineIndicator;
