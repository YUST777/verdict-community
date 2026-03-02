"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concurrencyOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentConcurrency = null;
const cliFlag = 'concurrency';
// Browser-safe validation that does not pull in Node.js modules
// (validate-concurrency.ts imports node:child_process via get-cpu-count.ts)
const validateConcurrencyValue = (value, setting) => {
    if (typeof value === 'undefined' || value === null) {
        return;
    }
    if (typeof value !== 'number' && typeof value !== 'string') {
        throw new Error(setting + ' must a number or a string but is ' + value);
    }
    if (typeof value === 'number') {
        if (value % 1 !== 0) {
            throw new Error(setting + ' must be an integer, but is ' + value);
        }
    }
    else if (!/^\d+(\.\d+)?%$/.test(value)) {
        throw new Error(`${setting} must be a number or percentage, but is ${JSON.stringify(value)}`);
    }
};
exports.concurrencyOption = {
    name: 'Concurrency',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["How many CPU threads to use. Minimum 1. The maximum is the amount of threads you have (In Node.JS ",
            jsx_runtime_1.jsx("code", { children: "os.cpus().length" }),
            "). You can also provide a percentage value (e.g. ",
            jsx_runtime_1.jsx("code", { children: "50%" }),
            ")."] })),
    ssrName: 'concurrency',
    docLink: 'https://www.remotion.dev/docs/config#setconcurrency',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            validateConcurrencyValue(value, 'concurrency');
            return {
                source: 'cli',
                value,
            };
        }
        if (currentConcurrency !== null) {
            return {
                source: 'config',
                value: currentConcurrency,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        validateConcurrencyValue(value, 'Config.setConcurrency');
        currentConcurrency = value;
    },
    id: cliFlag,
};
