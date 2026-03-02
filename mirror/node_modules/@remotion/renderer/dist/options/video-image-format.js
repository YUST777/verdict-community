"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoImageFormatOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const image_format_1 = require("../image-format");
let currentVideoImageFormat = null;
const cliFlag = 'image-format';
exports.videoImageFormatOption = {
    name: 'Video Image Format',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["The image format to use when rendering frames for a video. Must be one of", ' ', image_format_1.validVideoImageFormats.map((f) => `"${f}"`).join(', '), ". Default:", ' ', jsx_runtime_1.jsx("code", { children: "\"jpeg\"" }),
            ". JPEG is faster, but does not support transparency."] })),
    ssrName: 'imageFormat',
    docLink: 'https://www.remotion.dev/docs/renderer/render-media#imageformat',
    type: null,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const value = commandLine[cliFlag];
            if (!image_format_1.validVideoImageFormats.includes(value)) {
                throw new Error(`Invalid video image format: ${value}. Must be one of: ${image_format_1.validVideoImageFormats.join(', ')}`);
            }
            return {
                source: 'cli',
                value,
            };
        }
        if (currentVideoImageFormat !== null) {
            return {
                source: 'config',
                value: currentVideoImageFormat,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (value) => {
        if (value === null) {
            currentVideoImageFormat = null;
            return;
        }
        if (!image_format_1.validVideoImageFormats.includes(value)) {
            throw new TypeError([
                `Value ${value} is not valid as a video image format.`,
                // @ts-expect-error
                value === 'jpg' ? 'Did you mean "jpeg"?' : null,
            ]
                .filter(Boolean)
                .join(' '));
        }
        currentVideoImageFormat = value;
    },
    id: 'video-image-format',
};
