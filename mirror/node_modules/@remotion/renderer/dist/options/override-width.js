"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideWidthOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const validate_1 = require("../validate");
let currentWidth = null;
const cliFlag = 'width';
exports.overrideWidthOption = {
    name: 'Override Width',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Overrides the width of the composition." }),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#overridewidth',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            (0, validate_1.validateDimension)(value, 'width', 'in --width flag');
            return {
                source: 'cli',
                value,
            };
        }
        if (currentWidth !== null) {
            return {
                source: 'config',
                value: currentWidth,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (width) => {
        (0, validate_1.validateDimension)(width, 'width', 'in Config.overrideWidth()');
        currentWidth = width;
    },
    id: cliFlag,
};
