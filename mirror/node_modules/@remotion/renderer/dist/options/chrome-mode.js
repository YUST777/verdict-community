"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chromeModeOption = exports.validChromeModeOptions = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
exports.validChromeModeOptions = [
    'headless-shell',
    'chrome-for-testing',
];
const cliFlag = 'chrome-mode';
let configSelection = null;
exports.chromeModeOption = {
    cliFlag,
    name: 'Chrome Mode',
    ssrName: 'chromeMode',
    description: () => {
        return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["One of", ' ', exports.validChromeModeOptions.map((option, i) => (jsx_runtime_1.jsxs("code", { children: [option, i === exports.validChromeModeOptions.length - 1 ? '' : ', '] }, option))), ". Default ",
                jsx_runtime_1.jsx("code", { children: "headless-shell" }),
                ".", ' ', jsx_runtime_1.jsxs("a", { href: "https://remotion.dev/docs/miscellaneous/chrome-headless-shell", children: ["Use ",
                        jsx_runtime_1.jsx("code", { children: "chrome-for-testing" }),
                        " to take advantage of GPU drivers on Linux."] })
            ] }));
    },
    docLink: 'https://www.remotion.dev/chrome-for-testing',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag]) {
            if (!exports.validChromeModeOptions.includes(commandLine[cliFlag])) {
                throw new Error(`Invalid \`--${cliFlag}\` value passed. Accepted values: ${exports.validChromeModeOptions
                    .map((l) => `'${l}'`)
                    .join(', ')}.`);
            }
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        if (configSelection !== null) {
            return {
                value: configSelection,
                source: 'config',
            };
        }
        return {
            value: 'headless-shell',
            source: 'default',
        };
    },
    setConfig: (newChromeMode) => {
        configSelection = newChromeMode;
    },
    type: 'headless-shell',
    id: cliFlag,
};
