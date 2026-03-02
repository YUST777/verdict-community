"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rspackOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let rspackEnabled = false;
const cliFlag = 'experimental-rspack';
exports.rspackOption = {
    name: 'Experimental Rspack',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Uses Rspack instead of Webpack as the bundler for the Studio or bundle." })),
    ssrName: null,
    docLink: null,
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            rspackEnabled = true;
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        return {
            value: rspackEnabled,
            source: 'config',
        };
    },
    setConfig(value) {
        rspackEnabled = value;
    },
    id: cliFlag,
};
