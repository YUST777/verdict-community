"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentApiKey = null;
const cliFlag = 'api-key';
exports.apiKeyOption = {
    name: 'API key',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["API key for sending a usage event using ",
            jsx_runtime_1.jsx("code", { children: "@remotion/licensing" }),
            "."] })),
    ssrName: 'apiKey',
    docLink: 'https://www.remotion.dev/docs/licensing',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        return {
            source: 'default',
            value: currentApiKey,
        };
    },
    setConfig: (value) => {
        currentApiKey = value;
    },
    id: cliFlag,
};
