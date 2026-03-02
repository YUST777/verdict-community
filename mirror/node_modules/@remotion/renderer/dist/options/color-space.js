"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateColorSpace = exports.colorSpaceOption = exports.DEFAULT_COLOR_SPACE = exports.validColorSpaces = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const no_react_1 = require("remotion/no-react");
const validV4ColorSpaces = ['default', 'bt601', 'bt709', 'bt2020-ncl'];
const validV5ColorSpaces = ['bt601', 'bt709', 'bt2020-ncl'];
exports.validColorSpaces = (no_react_1.NoReactInternals.ENABLE_V5_BREAKING_CHANGES
    ? validV5ColorSpaces
    : validV4ColorSpaces);
exports.DEFAULT_COLOR_SPACE = (no_react_1.NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? 'bt709' : 'default');
let colorSpace = exports.DEFAULT_COLOR_SPACE;
const cliFlag = 'color-space';
exports.colorSpaceOption = {
    name: 'Color space',
    cliFlag: 'color-space',
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Color space to use for the video. Acceptable values:", ' ', jsx_runtime_1.jsxs("code", { children: ['"', exports.DEFAULT_COLOR_SPACE, '"'] }),
            "(default since 5.0),", ' ', no_react_1.NoReactInternals.ENABLE_V5_BREAKING_CHANGES ? (jsx_runtime_1.jsxs("code", { children: ['"', "bt601", '"', ', '] })) : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                    jsx_runtime_1.jsxs("code", { children: ['"', "bt601", '"'] }), ' ', "(same as", ' ', jsx_runtime_1.jsxs("code", { children: ['"', "default", '"'] }),
                    ", since v4.0.424),", ' ', jsx_runtime_1.jsxs("code", { children: ['"', "bt709", '"'] }), ' ', "(since v4.0.28),", ' '] })), jsx_runtime_1.jsxs("code", { children: ['"', "bt2020-ncl", '"'] }), ' ', "(since v4.0.88),", ' ', jsx_runtime_1.jsxs("code", { children: ['"', "bt2020-cl", '"'] }), ' ', "(since v4.0.88), .",
            jsx_runtime_1.jsx("br", {}),
            "For best color accuracy, it is recommended to also use", ' ', jsx_runtime_1.jsxs("code", { children: ['"', "png", '"'] }), ' ', "as the image format to have accurate color transformations throughout.",
            jsx_runtime_1.jsx("br", {}),
            "Only since v4.0.83, colorspace conversion is actually performed, previously it would only tag the metadata of the video."] })),
    docLink: 'https://www.remotion.dev/docs/renderer/render-media#colorspace',
    ssrName: 'colorSpace',
    type: exports.DEFAULT_COLOR_SPACE,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (colorSpace !== exports.DEFAULT_COLOR_SPACE) {
            return {
                source: 'config',
                value: colorSpace,
            };
        }
        return {
            source: 'default',
            value: exports.DEFAULT_COLOR_SPACE,
        };
    },
    setConfig: (value) => {
        colorSpace = value !== null && value !== void 0 ? value : exports.DEFAULT_COLOR_SPACE;
    },
    id: cliFlag,
};
const validateColorSpace = (option) => {
    if (exports.validColorSpaces.includes(option)) {
        return;
    }
    throw new Error(`Expected one of ${exports.validColorSpaces.map((c) => `"${c}"`).join(', ')} for ${exports.colorSpaceOption.ssrName} but got "${option}"`);
};
exports.validateColorSpace = validateColorSpace;
