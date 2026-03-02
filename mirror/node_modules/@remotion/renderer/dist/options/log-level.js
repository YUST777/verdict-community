"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLevelOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const log_level_1 = require("../log-level");
let logLevel = 'info';
const cliFlag = 'log';
exports.logLevelOption = {
    cliFlag,
    name: 'Log Level',
    ssrName: 'logLevel',
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["One of ",
            jsx_runtime_1.jsx("code", { children: "trace" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "verbose" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "info" }),
            ",", ' ', jsx_runtime_1.jsx("code", { children: "warn" }),
            ", ",
            jsx_runtime_1.jsx("code", { children: "error" }),
            ".",
            jsx_runtime_1.jsx("br", {}),
            " Determines how much info is being logged to the console.",
            jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("br", {}),
            " Default ",
            jsx_runtime_1.jsx("code", { children: "info" }),
            "."] })),
    docLink: 'https://www.remotion.dev/docs/troubleshooting/debug-failed-render',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag]) {
            if (!(0, log_level_1.isValidLogLevel)(commandLine[cliFlag])) {
                throw new Error(`Invalid \`--log\` value passed. Accepted values: ${log_level_1.logLevels
                    .map((l) => `'${l}'`)
                    .join(', ')}.`);
            }
            return { value: commandLine[cliFlag], source: 'cli' };
        }
        if (logLevel !== 'info') {
            return { value: logLevel, source: 'config' };
        }
        return { value: 'info', source: 'default' };
    },
    setConfig: (newLogLevel) => {
        logLevel = newLogLevel;
    },
    type: 'error',
    id: cliFlag,
};
