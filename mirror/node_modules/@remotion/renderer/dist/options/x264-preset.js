"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x264Option = exports.validateSelectedCodecAndPresetCombination = exports.x264PresetOptions = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
exports.x264PresetOptions = [
    'ultrafast',
    'superfast',
    'veryfast',
    'faster',
    'fast',
    'medium',
    'slow',
    'slower',
    'veryslow',
    'placebo',
];
let preset = null;
const validateSelectedCodecAndPresetCombination = ({ codec, x264Preset, }) => {
    if (x264Preset !== null &&
        codec !== 'h264' &&
        codec !== 'h264-mkv' &&
        codec !== 'h264-ts') {
        throw new TypeError(`You have set a x264 preset but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`);
    }
    if (x264Preset !== null &&
        !exports.x264PresetOptions.includes(x264Preset)) {
        throw new TypeError(`The Preset profile "${x264Preset}" is not valid. Valid options are ${exports.x264PresetOptions
            .map((p) => `"${p}"`)
            .join(', ')}`);
    }
};
exports.validateSelectedCodecAndPresetCombination = validateSelectedCodecAndPresetCombination;
const cliFlag = 'x264-preset';
const DEFAULT_PRESET = 'medium';
exports.x264Option = {
    name: 'x264 Preset',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Sets a x264 preset profile. Only applies to videos rendered with", ' ', jsx_runtime_1.jsx("code", { children: "h264" }),
            " codec.",
            jsx_runtime_1.jsx("br", {}),
            "Possible values: ",
            jsx_runtime_1.jsx("code", { children: "superfast" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "veryfast" }),
            ",", ' ', jsx_runtime_1.jsx("code", { children: "faster" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "fast" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "medium" }),
            ",", ' ', jsx_runtime_1.jsx("code", { children: "slow" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "slower" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "veryslow" }),
            ",", ' ', jsx_runtime_1.jsx("code", { children: "placebo" }),
            ".",
            jsx_runtime_1.jsx("br", {}),
            "Default: ",
            jsx_runtime_1.jsx("code", { children: DEFAULT_PRESET })
        ] })),
    ssrName: 'x264Preset',
    docLink: 'https://www.remotion.dev/docs/renderer/render-media',
    type: 'fast',
    getValue: ({ commandLine }) => {
        const value = commandLine[cliFlag];
        if (typeof value !== 'undefined') {
            return { value: value, source: 'cli' };
        }
        if (preset !== null) {
            return { value: preset, source: 'config' };
        }
        return { value: null, source: 'default' };
    },
    setConfig: (profile) => {
        preset = profile;
    },
    id: cliFlag,
};
