"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'config';
exports.configOption = {
    name: 'Config file',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Specify a location for the Remotion config file." }),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: () => {
        throw new Error('setConfig is not supported. Pass --config via the CLI instead.');
    },
    type: '',
    id: cliFlag,
};
