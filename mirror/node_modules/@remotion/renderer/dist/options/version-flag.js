"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionFlagOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'version';
exports.versionFlagOption = {
    name: 'Version',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Install a specific version. Also enables downgrading to an older version." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/upgrade#--version',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: String(commandLine[cliFlag]),
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: () => {
        throw new Error('Cannot set version via config file');
    },
    type: '',
    id: cliFlag,
};
