"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicLicenseKeyOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'public-license-key';
let currentPublicLicenseKey = null;
exports.publicLicenseKeyOption = {
    name: 'Public License Key',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["The public license key for your company license, obtained from the \"Usage\" tab on ",
            jsx_runtime_1.jsx("a", { href: "https://remotion.pro/dashboard", children: "remotion.pro" }),
            ". If you are eligible for the free license, pass \"free-license\"."] })),
    ssrName: 'publicLicenseKey',
    docLink: 'https://www.remotion.dev/docs/licensing',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentPublicLicenseKey !== null) {
            return {
                source: 'config',
                value: currentPublicLicenseKey,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        if (value && value !== 'free-license' && !value.startsWith('rm_pub_')) {
            throw new Error('Invalid public license key. It must start with "rm_pub_" or be "free-license".');
        }
        currentPublicLicenseKey = value;
    },
    type: null,
    id: cliFlag,
};
