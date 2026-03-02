"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propsOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'props';
exports.propsOption = {
    name: 'Input Props',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Input Props to pass to the selected composition of your video. Must be a serialized JSON string (",
            jsx_runtime_1.jsxs("code", { children: ["--props='", '{', "\"hello\": \"world\"", '}', "'"] }),
            ") or a path to a JSON file (",
            jsx_runtime_1.jsx("code", { children: "./path/to/props.json" }),
            ")."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: () => {
        throw new Error('setProps is not supported. Pass --props via the CLI instead.');
    },
    type: '',
    id: cliFlag,
};
