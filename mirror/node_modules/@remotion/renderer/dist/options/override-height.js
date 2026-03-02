"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideHeightOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const validate_1 = require("../validate");
let currentHeight = null;
const cliFlag = 'height';
exports.overrideHeightOption = {
    name: 'Override Height',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Overrides the height of the composition." }),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#overrideheight',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            (0, validate_1.validateDimension)(value, 'height', 'in --height flag');
            return {
                source: 'cli',
                value,
            };
        }
        if (currentHeight !== null) {
            return {
                source: 'config',
                value: currentHeight,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (height) => {
        (0, validate_1.validateDimension)(height, 'height', 'in Config.overrideHeight()');
        currentHeight = height;
    },
    id: cliFlag,
};
