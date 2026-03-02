"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageManagerOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'package-manager';
let currentPackageManager = null;
exports.packageManagerOption = {
    name: 'Package Manager',
    cliFlag,
    description: () => {
        return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Forces a specific package manager to be used. By default, Remotion will auto-detect the package manager based on your lockfile.",
                jsx_runtime_1.jsx("br", {}),
                "Acceptable values are ",
                jsx_runtime_1.jsx("code", { children: "npm" }),
                ", ",
                jsx_runtime_1.jsx("code", { children: "yarn" }),
                ",", ' ', jsx_runtime_1.jsx("code", { children: "pnpm" }),
                " and ",
                jsx_runtime_1.jsx("code", { children: "bun" }),
                "."] }));
    },
    ssrName: 'packageManager',
    docLink: 'https://www.remotion.dev/docs/cli/upgrade#--package-manager',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentPackageManager !== null) {
            return {
                source: 'config',
                value: currentPackageManager,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        currentPackageManager = value;
    },
    type: '',
    id: cliFlag,
};
