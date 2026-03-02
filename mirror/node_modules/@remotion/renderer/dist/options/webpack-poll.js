"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackPollOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'webpack-poll';
let webpackPolling = null;
exports.webpackPollOption = {
    name: 'Webpack Polling',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Enables Webpack polling instead of the file system event listeners for hot reloading. This is useful if you are inside a virtual machine or have a remote file system. Pass a value in milliseconds." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setwebpackpollinginmilliseconds',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const val = commandLine[cliFlag];
            if (typeof val !== 'number') {
                throw new TypeError(`Webpack polling must be a number, got ${JSON.stringify(val)}`);
            }
            return {
                source: 'cli',
                value: val,
            };
        }
        if (webpackPolling !== null) {
            return {
                source: 'config',
                value: webpackPolling,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        if (typeof value !== 'number' && value !== null) {
            throw new TypeError(`Polling must be a number or null, got ${JSON.stringify(value)} instead.`);
        }
        webpackPolling = value;
    },
    type: 0,
    id: cliFlag,
};
