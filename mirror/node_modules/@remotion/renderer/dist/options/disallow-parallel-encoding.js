"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disallowParallelEncodingOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let disallowParallelEncoding = false;
const cliFlag = 'disallow-parallel-encoding';
exports.disallowParallelEncodingOption = {
    name: 'Disallow parallel encoding',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Disallows the renderer from doing rendering frames and encoding at the same time. This makes the rendering process more memory-efficient, but possibly slower." })),
    ssrName: 'disallowParallelEncoding',
    docLink: 'https://www.remotion.dev/docs/config#setdisallowparallelencoding',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        if (disallowParallelEncoding !== false) {
            return {
                value: disallowParallelEncoding,
                source: 'config',
            };
        }
        return {
            value: false,
            source: 'default',
        };
    },
    setConfig(value) {
        disallowParallelEncoding = value;
    },
    id: cliFlag,
};
