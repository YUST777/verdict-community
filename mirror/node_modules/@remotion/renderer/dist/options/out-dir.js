"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outDirOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'out-dir';
let currentOutDir = null;
exports.outDirOption = {
    name: 'Output Directory',
    cliFlag,
    description: () => {
        return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Define the location of the resulting bundle. By default it is a folder called ",
                jsx_runtime_1.jsx("code", { children: "build" }),
                ", adjacent to the", ' ', jsx_runtime_1.jsx("a", { href: "/docs/terminology/remotion-root", children: "Remotion Root" }),
                "."] }));
    },
    ssrName: 'outDir',
    docLink: 'https://www.remotion.dev/docs/cli/bundle#--out-dir',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentOutDir !== null) {
            return {
                source: 'config',
                value: currentOutDir,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        currentOutDir = value;
    },
    type: '',
    id: cliFlag,
};
