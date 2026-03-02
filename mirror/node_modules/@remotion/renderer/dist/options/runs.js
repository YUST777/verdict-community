"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runsOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DEFAULT_RUNS = 3;
let currentRuns = DEFAULT_RUNS;
const cliFlag = 'runs';
exports.runsOption = {
    name: 'Benchmark runs',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Specify how many times the video should be rendered during a benchmark. Default ",
            jsx_runtime_1.jsx("code", { children: DEFAULT_RUNS }),
            "."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/benchmark#--runs',
    type: DEFAULT_RUNS,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = Number(commandLine[cliFlag]);
            if (isNaN(value) || value < 1) {
                throw new Error(`--runs must be a positive number, but got ${commandLine[cliFlag]}`);
            }
            return { value, source: 'cli' };
        }
        if (currentRuns !== DEFAULT_RUNS) {
            return { value: currentRuns, source: 'config' };
        }
        return { value: DEFAULT_RUNS, source: 'default' };
    },
    setConfig: (value) => {
        if (typeof value !== 'number' || isNaN(value) || value < 1) {
            throw new Error(`Runs must be a positive number, but got ${value}`);
        }
        currentRuns = value;
    },
    id: cliFlag,
};
