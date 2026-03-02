"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameRangeSetting = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const InputDragger_1 = require("../NewComposition/InputDragger");
const layout_1 = require("./layout");
const MultiRangeSlider_1 = require("./MultiRangeSlider");
const INPUT_WIDTH = 40;
const FrameRangeSetting = ({ startFrame, endFrame, setEndFrame, durationInFrames, setStartFrame }) => {
    const minStartFrame = 0;
    const maxEndFrame = durationInFrames - 1;
    const onStartFrameChangedDirectly = (0, react_1.useCallback)((newStartFrame) => {
        setStartFrame(newStartFrame);
    }, [setStartFrame]);
    const onEndFrameChangedDirectly = (0, react_1.useCallback)((newEndFrame) => {
        setEndFrame(newEndFrame);
    }, [setEndFrame]);
    const onStartFrameChanged = (0, react_1.useCallback)((newVal) => {
        onStartFrameChangedDirectly(parseInt(newVal, 10));
    }, [onStartFrameChangedDirectly]);
    const onEndFrameChanged = (0, react_1.useCallback)((newVal) => {
        onEndFrameChangedDirectly(parseInt(newVal, 10));
    }, [onEndFrameChangedDirectly]);
    return (jsx_runtime_1.jsxs("div", { style: layout_1.optionRow, children: [
            jsx_runtime_1.jsx("div", { style: layout_1.label, children: "Frame range" }), jsx_runtime_1.jsxs("div", { style: layout_1.rightRow, children: [
                    jsx_runtime_1.jsx("div", { style: { width: INPUT_WIDTH }, children: jsx_runtime_1.jsx(InputDragger_1.InputDragger, { min: minStartFrame, max: endFrame - 1, name: "Start frame", value: startFrame, step: 1, onTextChange: onStartFrameChanged, onValueChange: onStartFrameChangedDirectly, status: "ok", rightAlign: true, style: { width: INPUT_WIDTH } }) }), jsx_runtime_1.jsx(MultiRangeSlider_1.MultiRangeSlider, { min: minStartFrame, max: maxEndFrame, start: startFrame, end: endFrame, step: 1, onLeftThumbDrag: onStartFrameChangedDirectly, onRightThumbDrag: onEndFrameChangedDirectly }), ' ', jsx_runtime_1.jsx("div", { style: { width: INPUT_WIDTH }, children: jsx_runtime_1.jsx(InputDragger_1.InputDragger, { min: startFrame + 1, max: maxEndFrame, name: "End frame", value: endFrame, step: 1, onTextChange: onEndFrameChanged, onValueChange: onEndFrameChangedDirectly, status: "ok", rightAlign: true, style: { width: INPUT_WIDTH } }) })
                ] })
        ] }));
};
exports.FrameRangeSetting = FrameRangeSetting;
