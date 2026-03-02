"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.darkModeOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DEFAULT_VALUE = false;
let darkMode = DEFAULT_VALUE;
const cliFlag = 'dark-mode';
exports.darkModeOption = {
    name: 'Dark Mode',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Whether Chromium should pretend to be in dark mode by emulating the media feature 'prefers-color-scheme: dark'. Default is", ' ', jsx_runtime_1.jsx("code", { children: String(DEFAULT_VALUE) }),
            "."] })),
    ssrName: 'darkMode',
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--dark-mode',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (darkMode !== DEFAULT_VALUE) {
            return {
                source: 'config',
                value: darkMode,
            };
        }
        return {
            source: 'default',
            value: DEFAULT_VALUE,
        };
    },
    setConfig: (value) => {
        darkMode = value;
    },
    id: cliFlag,
};
