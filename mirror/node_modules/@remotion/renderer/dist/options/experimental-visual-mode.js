"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.experimentalVisualModeOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let experimentalVisualModeEnabled = false;
const cliFlag = 'experimental-visual-mode';
exports.experimentalVisualModeOption = {
    name: 'Experimental Visual Mode',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Nothing here yet, but this is our playground for experiments." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setexperimentalvisualmode',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== null) {
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        return {
            value: experimentalVisualModeEnabled,
            source: 'config',
        };
    },
    setConfig(value) {
        experimentalVisualModeEnabled = value;
    },
    id: cliFlag,
};
