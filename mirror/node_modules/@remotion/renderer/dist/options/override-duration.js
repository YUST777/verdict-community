"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideDurationOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const validate_1 = require("../validate");
let currentDuration = null;
const cliFlag = 'duration';
exports.overrideDurationOption = {
    name: 'Override Duration',
    cliFlag,
    description: () => jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Overrides the duration in frames of the composition." }),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#overrideduration',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            (0, validate_1.validateDurationInFrames)(value, {
                component: 'in --duration flag',
                allowFloats: false,
            });
            return {
                source: 'cli',
                value,
            };
        }
        if (currentDuration !== null) {
            return {
                source: 'config',
                value: currentDuration,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (duration) => {
        (0, validate_1.validateDurationInFrames)(duration, {
            component: 'in Config.overrideDuration()',
            allowFloats: false,
        });
        currentDuration = duration;
    },
    id: cliFlag,
};
