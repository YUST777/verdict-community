"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioLatencyHintOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'audio-latency-hint';
let value = null;
exports.audioLatencyHintOption = {
    name: 'Audio Latency Hint',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Sets the", ' ', jsx_runtime_1.jsx("a", { href: "https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext", children: "audio latency" }), ' ', "hint for the global ",
            jsx_runtime_1.jsx("code", { children: "AudioContext" }),
            " context that Remotion uses to play audio.",
            jsx_runtime_1.jsx("br", {}),
            "Possible values: ",
            jsx_runtime_1.jsx("code", { children: "interactive" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "balanced" }),
            ",", ' ', jsx_runtime_1.jsx("code", { children: "playback" })
        ] })),
    ssrName: 'audioLatencyHint',
    docLink: 'https://www.remotion.dev/docs/renderer/render-media',
    type: 'interactive',
    getValue: ({ commandLine }) => {
        const val = commandLine[cliFlag];
        if (typeof val !== 'undefined') {
            return { value: val, source: 'cli' };
        }
        if (value !== null) {
            return { value, source: 'config' };
        }
        return { value: null, source: 'default' };
    },
    setConfig: (profile) => {
        value = profile;
    },
    id: cliFlag,
};
