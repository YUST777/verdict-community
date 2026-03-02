"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableCrossSiteIsolationOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let enableCrossSiteIsolation = false;
const cliFlag = 'cross-site-isolation';
exports.enableCrossSiteIsolationOption = {
    name: 'Enable Cross-Site Isolation',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Enable Cross-Site Isolation in the Studio (sets Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy HTTP headers, required for", ' ', jsx_runtime_1.jsx("code", { children: "@remotion/whisper-web" }),
            ")."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setenablecrosssiteisolation',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        return {
            value: enableCrossSiteIsolation,
            source: 'config',
        };
    },
    setConfig(value) {
        enableCrossSiteIsolation = value;
    },
    id: cliFlag,
};
