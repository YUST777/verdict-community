"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableMultiprocessOnLinuxOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DEFAULT_VALUE = true;
let multiProcessOnLinux = DEFAULT_VALUE;
const cliFlag = 'enable-multiprocess-on-linux';
exports.enableMultiprocessOnLinuxOption = {
    name: 'Enable Multiprocess on Linux',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Removes the ",
            jsx_runtime_1.jsx("code", { children: '--single-process' }),
            " flag that gets passed to Chromium on Linux by default. This will make the render faster because multiple processes can be used, but may cause issues with some Linux distributions or if window server libraries are missing.",
            jsx_runtime_1.jsx("br", {}),
            "Default: ",
            jsx_runtime_1.jsx("code", { children: "false" }),
            " until v4.0.136, then ",
            jsx_runtime_1.jsx("code", { children: "true" }),
            " from v4.0.137 on because newer Chrome versions ", "don't", " allow rendering with the ",
            jsx_runtime_1.jsx("code", { children: "--single-process" }),
            " flag. ",
            jsx_runtime_1.jsx("br", {}),
            "This flag will be removed in Remotion v5.0."] })),
    ssrName: 'chromiumOptions.enableMultiprocessOnLinux',
    docLink: 'https://www.remotion.dev/docs/chromium-flags',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (multiProcessOnLinux !== false) {
            return {
                source: 'config',
                value: multiProcessOnLinux,
            };
        }
        return {
            source: 'default',
            value: DEFAULT_VALUE,
        };
    },
    setConfig: (value) => {
        multiProcessOnLinux = value;
    },
    id: cliFlag,
};
