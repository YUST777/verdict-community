"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmarkConcurrenciesOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let currentConcurrencies = null;
const cliFlag = 'concurrencies';
exports.benchmarkConcurrenciesOption = {
    name: 'Benchmark concurrencies',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Specify which concurrency values should be used while benchmarking. Multiple values can be passed separated by comma. Learn more about", ' ', jsx_runtime_1.jsx("a", { href: "https://remotion.dev/docs/terminology/concurrency", children: "concurrency" }),
            "."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/benchmark#--concurrencies',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return { value: commandLine[cliFlag], source: 'cli' };
        }
        if (currentConcurrencies !== null) {
            return { value: currentConcurrencies, source: 'config' };
        }
        return { value: null, source: 'default' };
    },
    setConfig: (value) => {
        currentConcurrencies = value;
    },
    id: cliFlag,
};
