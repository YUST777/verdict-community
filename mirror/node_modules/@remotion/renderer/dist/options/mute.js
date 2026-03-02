"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutedOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DEFAULT_MUTED_STATE = false;
let mutedState = DEFAULT_MUTED_STATE;
const cliFlag = 'muted';
exports.mutedOption = {
    name: 'Muted',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "The Audio of the video will be omitted." }),
    ssrName: 'muted',
    docLink: 'https://www.remotion.dev/docs/audio/muting',
    type: false,
    getValue: ({ commandLine }) => {
        // we set in minimist `muted` default as null
        if (commandLine[cliFlag] !== null) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (mutedState !== DEFAULT_MUTED_STATE) {
            return {
                source: 'config',
                value: mutedState,
            };
        }
        return {
            source: 'config',
            value: mutedState,
        };
    },
    setConfig: () => {
        mutedState = true;
    },
    id: cliFlag,
};
