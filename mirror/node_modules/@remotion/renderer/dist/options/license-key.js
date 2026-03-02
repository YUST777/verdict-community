"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseKeyOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentLicenseKey = null;
const cliFlag = 'license-key';
exports.licenseKeyOption = {
    name: 'License key',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["License key for sending a usage event using", ' ', jsx_runtime_1.jsx("code", { children: "@remotion/licensing" }),
            "."] })),
    ssrName: 'licenseKey',
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
            value: currentLicenseKey,
        };
    },
    setConfig: (value) => {
        currentLicenseKey = value;
    },
    id: cliFlag,
};
