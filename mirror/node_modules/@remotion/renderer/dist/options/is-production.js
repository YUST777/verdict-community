"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProductionOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'is-production';
let currentIsProductionKey = null;
exports.isProductionOption = {
    name: 'Is Production',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Pass ",
            jsx_runtime_1.jsx("code", { children: "false" }),
            " if this a development render to not count it as a billable render on remotion.pro. Only can be used in conjuction with", ' ', jsx_runtime_1.jsx("code", { children: "licenseKey" }),
            "."] })),
    ssrName: 'isProduction',
    docLink: 'https://www.remotion.dev/docs/licensing',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentIsProductionKey !== null) {
            return {
                source: 'config',
                value: currentIsProductionKey,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        currentIsProductionKey = value;
    },
    type: false,
    id: cliFlag,
};
