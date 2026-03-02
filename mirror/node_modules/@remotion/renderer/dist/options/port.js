"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'port';
let currentPort = null;
exports.portOption = {
    name: 'Port',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Set a custom HTTP server port for the Studio or the render process. If not defined, Remotion will try to find a free port." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setstudioport',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentPort !== null) {
            return {
                source: 'config',
                value: currentPort,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        currentPort = value;
    },
    type: 0,
    id: cliFlag,
};
