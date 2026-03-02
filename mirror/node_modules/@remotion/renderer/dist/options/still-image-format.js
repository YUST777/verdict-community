"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stillImageFormatOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const image_format_1 = require("../image-format");
let currentStillImageFormat = null;
const cliFlag = 'image-format';
exports.stillImageFormatOption = {
    name: 'Still Image Format',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["The image format to use when rendering a still. Must be one of", ' ', image_format_1.validStillImageFormats.map((f) => `"${f}"`).join(', '), ". Default:", ' ', jsx_runtime_1.jsx("code", { children: "\"png\"" }),
            "."] })),
    ssrName: 'imageFormat',
    docLink: 'https://www.remotion.dev/docs/renderer/render-still#imageformat',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            if (!image_format_1.validStillImageFormats.includes(value)) {
                throw new Error(`Invalid still image format: ${value}. Must be one of: ${image_format_1.validStillImageFormats.join(', ')}`);
            }
            return {
                source: 'cli',
                value,
            };
        }
        if (currentStillImageFormat !== null) {
            return {
                source: 'config',
                value: currentStillImageFormat,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        if (value === null) {
            currentStillImageFormat = null;
            return;
        }
        if (!image_format_1.validStillImageFormats.includes(value)) {
            throw new TypeError([
                `Value ${value} is not valid as a still image format.`,
                // @ts-expect-error
                value === 'jpg' ? 'Did you mean "jpeg"?' : null,
            ]
                .filter(Boolean)
                .join(' '));
        }
        currentStillImageFormat = value;
    },
    id: 'still-image-format',
};
