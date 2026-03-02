"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleCacheOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'bundle-cache';
let cachingEnabled = true;
exports.bundleCacheOption = {
    name: 'Webpack Bundle Caching',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Enable or disable Webpack caching. This flag is enabled by default, use", ' ', jsx_runtime_1.jsx("code", { children: "--bundle-cache=false" }),
            " to disable caching."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setcachingenabled',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
            return {
                source: 'cli',
                value: Boolean(commandLine[cliFlag]),
            };
        }
        return {
            source: cachingEnabled ? 'default' : 'config',
            value: cachingEnabled,
        };
    },
    setConfig: (value) => {
        if (typeof value !== 'boolean') {
            throw new TypeError(`Value for "${cliFlag}" must be a boolean, but got ${typeof value}.`);
        }
        cachingEnabled = value;
    },
    type: true,
    id: cliFlag,
};
