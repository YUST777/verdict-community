"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'browser';
exports.browserOption = {
    name: 'Browser',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Specify the browser which should be used for opening a tab. The default browser will be used by default. Pass an absolute path or", ' ', jsx_runtime_1.jsx("code", { children: "\"chrome\"" }),
            " to use Chrome. If Chrome is selected as the browser and you are on macOS, Remotion will try to reuse an existing tab."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/studio#--browser',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: () => {
        throw new Error('setBrowser is not supported. Pass --browser via the CLI instead.');
    },
    type: '',
    id: cliFlag,
};
