"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitterContainer = exports.containerColumn = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const timeline_1 = require("../../state/timeline");
const SplitterContext_1 = require("./SplitterContext");
const containerRow = {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    width: '100%',
};
exports.containerColumn = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 0,
};
const SplitterContainer = ({ orientation, children, defaultFlex, maxFlex, minFlex, id }) => {
    const [initialTimelineFlex, persistFlex] = (0, timeline_1.useTimelineFlex)(id);
    const [flexValue, setFlexValue] = (0, react_1.useState)(initialTimelineFlex !== null && initialTimelineFlex !== void 0 ? initialTimelineFlex : defaultFlex);
    const ref = (0, react_1.useRef)(null);
    const isDragging = (0, react_1.useRef)(false);
    const value = (0, react_1.useMemo)(() => {
        return {
            flexValue,
            ref,
            setFlexValue,
            isDragging,
            orientation,
            id,
            maxFlex,
            minFlex,
            defaultFlex,
            persistFlex,
        };
    }, [
        defaultFlex,
        flexValue,
        id,
        maxFlex,
        minFlex,
        orientation,
        persistFlex,
        ref,
    ]);
    return (jsx_runtime_1.jsx(SplitterContext_1.SplitterContext.Provider, { value: value, children: jsx_runtime_1.jsx("div", { ref: ref, style: orientation === 'horizontal' ? exports.containerColumn : containerRow, children: children }) }));
};
exports.SplitterContainer = SplitterContainer;
