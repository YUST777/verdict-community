"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideFpsOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const validate_1 = require("../validate");
let currentFps = null;
const cliFlag = 'fps';
exports.overrideFpsOption = {
    name: 'Override FPS',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Overrides the frames per second of the composition." }),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#overridefps',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            (0, validate_1.validateFps)(value, 'in --fps flag', false);
            return {
                source: 'cli',
                value,
            };
        }
        if (currentFps !== null) {
            return {
                source: 'config',
                value: currentFps,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (fps) => {
        (0, validate_1.validateFps)(fps, 'in Config.overrideFps()', false);
        currentFps = fps;
    },
    id: cliFlag,
};
