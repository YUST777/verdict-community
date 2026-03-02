"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stillFrameOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const no_react_1 = require("remotion/no-react");
const cliFlag = 'frame';
let currentFrame = null;
const validate = (frame) => {
    no_react_1.NoReactInternals.validateFrame({
        frame,
        durationInFrames: Infinity,
        allowFloats: false,
    });
};
exports.stillFrameOption = {
    name: 'Frame',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Which frame should be rendered when rendering a still. Default", ' ', jsx_runtime_1.jsx("code", { children: "0" }),
            ". From v3.2.27, negative values are allowed, with", ' ', jsx_runtime_1.jsx("code", { children: "-1" }),
            " being the last frame."] })),
    ssrName: 'frame',
    docLink: 'https://www.remotion.dev/docs/cli/still#--frame',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const frame = Number(commandLine[cliFlag]);
            validate(frame);
            return {
                source: 'cli',
                value: frame,
            };
        }
        if (currentFrame !== null) {
            return {
                source: 'config',
                value: currentFrame,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        if (value !== null) {
            validate(value);
        }
        currentFrame = value;
    },
    type: 0,
    id: cliFlag,
};
