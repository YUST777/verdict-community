"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRenderModalPicture = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Checkbox_1 = require("../Checkbox");
const ComboBox_1 = require("../NewComposition/ComboBox");
const layout_1 = require("./layout");
const NumberSetting_1 = require("./NumberSetting");
const quality_options_1 = require("./quality-options");
const ScaleSetting_1 = require("./ScaleSetting");
const tabContainer = {
    flex: 1,
};
const WebRenderModalPicture = ({ renderMode, videoBitrate, setVideoBitrate, keyframeIntervalInSeconds, setKeyframeIntervalInSeconds, transparent, setTransparent, scale, setScale, compositionWidth, compositionHeight, }) => {
    const qualityOptions = (0, react_1.useMemo)(() => (0, quality_options_1.getQualityOptions)(videoBitrate, setVideoBitrate), [videoBitrate, setVideoBitrate]);
    const onTransparentChanged = (0, react_1.useCallback)((e) => {
        setTransparent(e.target.checked);
    }, [setTransparent]);
    return (jsx_runtime_1.jsxs("div", { style: tabContainer, children: [
            jsx_runtime_1.jsx(ScaleSetting_1.ScaleSetting, { scale: scale, setScale: setScale, compositionWidth: compositionWidth, compositionHeight: compositionHeight }), renderMode !== 'video' ? null : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                    jsx_runtime_1.jsxs("div", { style: layout_1.optionRow, children: [
                            jsx_runtime_1.jsx("div", { style: layout_1.label, children: "Quality" }), jsx_runtime_1.jsx("div", { style: layout_1.rightRow, children: jsx_runtime_1.jsx(ComboBox_1.Combobox, { values: qualityOptions, selectedId: videoBitrate, title: "Quality" }) })
                        ] }), jsx_runtime_1.jsx(NumberSetting_1.NumberSetting, { name: "Keyframe Interval", formatter: (v) => `${v}s`, min: 1, max: 300, step: 1, value: keyframeIntervalInSeconds, onValueChanged: setKeyframeIntervalInSeconds }), jsx_runtime_1.jsxs("div", { style: layout_1.optionRow, children: [
                            jsx_runtime_1.jsx("div", { style: layout_1.label, children: "Transparent" }), jsx_runtime_1.jsx("div", { style: layout_1.rightRow, children: jsx_runtime_1.jsx(Checkbox_1.Checkbox, { checked: transparent, onChange: onTransparentChanged, name: "transparent" }) })
                        ] })
                ] }))] }));
};
exports.WebRenderModalPicture = WebRenderModalPicture;
