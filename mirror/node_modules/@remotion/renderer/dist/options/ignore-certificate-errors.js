"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ignoreCertificateErrorsOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let ignoreCertificateErrors = false;
const cliFlag = 'ignore-certificate-errors';
exports.ignoreCertificateErrorsOption = {
    name: 'Ignore certificate errors',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored." })),
    ssrName: 'ignoreCertificateErrors',
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--ignore-certificate-errors',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: Boolean(commandLine[cliFlag]),
            };
        }
        if (ignoreCertificateErrors) {
            return {
                source: 'config',
                value: ignoreCertificateErrors,
            };
        }
        return {
            source: 'default',
            value: false,
        };
    },
    setConfig: (value) => {
        ignoreCertificateErrors = value;
    },
    id: cliFlag,
};
