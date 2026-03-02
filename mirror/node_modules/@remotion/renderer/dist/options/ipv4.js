"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipv4Option = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let forceIPv4 = false;
const cliFlag = 'ipv4';
exports.ipv4Option = {
    name: 'IPv4',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Forces Remotion to bind to an IPv4 interface for the Studio server." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/studio',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        return {
            value: forceIPv4,
            source: 'config',
        };
    },
    setConfig(value) {
        forceIPv4 = value;
    },
    id: cliFlag,
};
