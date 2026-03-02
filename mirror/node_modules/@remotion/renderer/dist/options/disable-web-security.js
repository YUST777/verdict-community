"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableWebSecurityOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let disableWebSecurity = false;
const cliFlag = 'disable-web-security';
exports.disableWebSecurityOption = {
    name: 'Disable web security',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "This will most notably disable CORS in Chrome among other security features." })),
    ssrName: 'disableWebSecurity',
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--disable-web-security',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: Boolean(commandLine[cliFlag]),
            };
        }
        if (disableWebSecurity) {
            return {
                source: 'config',
                value: disableWebSecurity,
            };
        }
        return {
            source: 'default',
            value: false,
        };
    },
    setConfig: (value) => {
        disableWebSecurity = value;
    },
    id: cliFlag,
};
