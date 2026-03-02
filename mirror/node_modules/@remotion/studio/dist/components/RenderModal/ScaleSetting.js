"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleSetting = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../../helpers/colors");
const NumberSetting_1 = require("./NumberSetting");
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const outputDimensionsStyle = {
    fontSize: 13,
    color: colors_1.LIGHT_TEXT,
    fontFamily: 'sans-serif',
    paddingRight: 16,
    textAlign: 'right',
    marginBottom: 14,
    marginTop: -10,
};
const ScaleSetting = ({ scale, setScale, compositionWidth, compositionHeight }) => {
    const outputDimensions = (0, react_1.useMemo)(() => {
        const outputWidth = Math.round(compositionWidth * scale);
        const outputHeight = Math.round(compositionHeight * scale);
        return `${outputWidth}×${outputHeight}`;
    }, [compositionWidth, compositionHeight, scale]);
    return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
            jsx_runtime_1.jsx(NumberSetting_1.NumberSetting, { min: MIN_SCALE, max: MAX_SCALE, step: 0.1, name: "Scale", formatter: (w) => {
                    if (typeof w === 'number') {
                        return `${w.toFixed(1)}x`;
                    }
                    return `${w}x`;
                }, onValueChanged: setScale, value: scale, hint: 'scaleOption' }), scale !== 1 && (jsx_runtime_1.jsxs("div", { style: outputDimensionsStyle, children: ["Output resolution: ", outputDimensions] }))] }));
};
exports.ScaleSetting = ScaleSetting;
