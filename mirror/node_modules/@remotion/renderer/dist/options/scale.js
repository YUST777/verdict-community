"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentScale = 1;
const cliFlag = 'scale';
const validateScale = (value) => {
    if (typeof value !== 'number') {
        throw new Error('scale must be a number.');
    }
};
exports.scaleOption = {
    name: 'Scale',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Scales the output dimensions by a factor. For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of ",
            jsx_runtime_1.jsx("code", { children: "1.5" }),
            ". See ",
            jsx_runtime_1.jsx("a", { href: "https://www.remotion.dev/docs/scaling", children: "Scaling" }),
            " for more details."] })),
    ssrName: 'scale',
    docLink: 'https://www.remotion.dev/docs/scaling',
    type: 0,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            validateScale(commandLine[cliFlag]);
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentScale !== null) {
            return {
                source: 'config',
                value: currentScale,
            };
        }
        return {
            source: 'default',
            value: 1,
        };
    },
    setConfig: (scale) => {
        currentScale = scale;
    },
    id: cliFlag,
};
