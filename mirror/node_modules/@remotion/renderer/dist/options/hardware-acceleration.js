"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardwareAccelerationOption = exports.getHardwareAcceleration = exports.hardwareAccelerationOptions = void 0;
exports.hardwareAccelerationOptions = [
    'disable',
    'if-possible',
    'required',
];
const cliFlag = 'hardware-acceleration';
let currentValue = null;
const getHardwareAcceleration = () => {
    return currentValue;
};
exports.getHardwareAcceleration = getHardwareAcceleration;
exports.hardwareAccelerationOption = {
    name: 'Hardware Acceleration',
    cliFlag,
    description: () => `
			One of
			${new Intl.ListFormat('en', { type: 'disjunction' }).format(exports.hardwareAccelerationOptions.map((a) => JSON.stringify(a)))}
			. Default "disable". Encode using a hardware-accelerated encoder if
			available. If set to "required" and no hardware-accelerated encoder is
			available, then the render will fail.
		`,
    ssrName: 'hardwareAcceleration',
    docLink: 'https://www.remotion.dev/docs/encoding',
    type: 'disable',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            if (!exports.hardwareAccelerationOptions.includes(value)) {
                throw new Error(`Invalid value for --${cliFlag}: ${value}`);
            }
            return {
                source: 'cli',
                value,
            };
        }
        if (currentValue !== null) {
            return {
                source: 'config',
                value: currentValue,
            };
        }
        return {
            source: 'default',
            value: 'disable',
        };
    },
    setConfig: (value) => {
        if (!exports.hardwareAccelerationOptions.includes(value)) {
            throw new Error(`Invalid value for --${cliFlag}: ${value}`);
        }
        currentValue = value;
    },
    id: cliFlag,
};
