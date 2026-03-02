"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pixelFormatOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const pixel_format_1 = require("../pixel-format");
let currentPixelFormat = pixel_format_1.DEFAULT_PIXEL_FORMAT;
const cliFlag = 'pixel-format';
exports.pixelFormatOption = {
    name: 'Pixel format',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Sets the pixel format in FFmpeg. See", ' ', jsx_runtime_1.jsx("a", { href: "https://trac.ffmpeg.org/wiki/Chroma%20Subsampling", children: "the FFmpeg docs for an explanation" }),
            ". Acceptable values: ", pixel_format_1.validPixelFormats.map((f) => `"${f}"`).join(', '), "."] })),
    ssrName: 'pixelFormat',
    docLink: 'https://www.remotion.dev/docs/config#setpixelformat',
    type: pixel_format_1.DEFAULT_PIXEL_FORMAT,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (currentPixelFormat !== pixel_format_1.DEFAULT_PIXEL_FORMAT) {
            return {
                source: 'config',
                value: currentPixelFormat,
            };
        }
        return {
            source: 'default',
            value: pixel_format_1.DEFAULT_PIXEL_FORMAT,
        };
    },
    setConfig: (value) => {
        if (!pixel_format_1.validPixelFormats.includes(value)) {
            throw new TypeError(`Value ${value} is not valid as a pixel format.`);
        }
        currentPixelFormat = value;
    },
    id: cliFlag,
};
