"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAgentOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let userAgent = null;
const cliFlag = 'user-agent';
exports.userAgentOption = {
    name: 'User agent',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Lets you set a custom user agent that the headless Chrome browser assumes." })),
    ssrName: 'userAgent',
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--user-agent',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (userAgent !== null) {
            return {
                source: 'config',
                value: userAgent,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        userAgent = value;
    },
    id: cliFlag,
};
