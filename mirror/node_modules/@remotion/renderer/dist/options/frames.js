"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.framesOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const frame_range_1 = require("../frame-range");
const cliFlag = 'frames';
let frameRange = null;
const parseFrameRangeFromCli = (newFrameRange) => {
    if (typeof newFrameRange === 'number') {
        if (newFrameRange < 0) {
            return [0, Math.abs(newFrameRange)];
        }
        return newFrameRange;
    }
    if (typeof newFrameRange === 'string') {
        if (newFrameRange.trim() === '') {
            throw new Error('--frames flag must be a single number, or 2 numbers separated by `-`');
        }
        const parts = newFrameRange.split('-');
        if (parts.length > 2 || parts.length <= 0) {
            throw new Error(`--frames flag must be a number or 2 numbers separated by '-', instead got ${parts.length} numbers`);
        }
        if (parts.length === 1) {
            const value = Number(parts[0]);
            if (isNaN(value)) {
                throw new Error('--frames flag must be a single number, or 2 numbers separated by `-`');
            }
            return value;
        }
        const [firstPart, secondPart] = parts;
        if (secondPart === '' && firstPart !== '') {
            const start = Number(firstPart);
            if (isNaN(start)) {
                throw new Error('--frames flag must be a single number, or 2 numbers separated by `-`');
            }
            return [start, null];
        }
        const parsed = parts.map((f) => Number(f));
        const [first, second] = parsed;
        for (const value of parsed) {
            if (isNaN(value)) {
                throw new Error('--frames flag must be a single number, or 2 numbers separated by `-`');
            }
        }
        if (second < first) {
            throw new Error('The second number of the --frames flag number should be greater or equal than first number');
        }
        return [first, second];
    }
    throw new Error('--frames flag must be a single number, or 2 numbers separated by `-`');
};
exports.framesOption = {
    name: 'Frame Range',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Render a subset of a video. Pass a single number to render a still, or a range (e.g. ",
            jsx_runtime_1.jsx("code", { children: "0-9" }),
            ") to render a subset of frames. Pass", ' ', jsx_runtime_1.jsx("code", { children: "100-" }),
            " to render from frame 100 to the end."] })),
    ssrName: 'frameRange',
    docLink: 'https://www.remotion.dev/docs/config#setframerange',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = parseFrameRangeFromCli(commandLine[cliFlag]);
            (0, frame_range_1.validateFrameRange)(value);
            return {
                source: 'cli',
                value,
            };
        }
        return {
            source: 'config',
            value: frameRange,
        };
    },
    setConfig: (value) => {
        if (value !== null) {
            (0, frame_range_1.validateFrameRange)(value);
        }
        frameRange = value;
    },
    id: cliFlag,
};
