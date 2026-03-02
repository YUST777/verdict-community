"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserExecutableOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentBrowserExecutablePath = null;
const cliFlag = 'browser-executable';
exports.browserExecutableOption = {
    name: 'Browser executable',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Set a custom Chrome or Chromium executable path. By default Remotion will try to find an existing version of Chrome on your system and if not found, it will download one. This flag is useful if you don't have Chrome installed in a standard location and you want to prevent downloading an additional browser or need support for the H264 codec." })),
    ssrName: 'browserExecutable',
    docLink: 'https://www.remotion.dev/docs/config#setbrowserexecutable',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentBrowserExecutablePath !== null) {
            return {
                source: 'config',
                value: currentBrowserExecutablePath,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        currentBrowserExecutablePath = value;
    },
    id: cliFlag,
};
