"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageSequenceOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const cliFlag = 'sequence';
let imageSequence = false;
exports.imageSequenceOption = {
    name: 'Image Sequence',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Pass this flag to output an image sequence instead of a video. The default image format is JPEG. See", ' ', jsx_runtime_1.jsx("a", { href: "/docs/config#setimagesequence", children: jsx_runtime_1.jsx("code", { children: "setImageSequence()" }) }), ' ', "for more details."] })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setimagesequence',
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: Boolean(commandLine[cliFlag]),
            };
        }
        return {
            source: imageSequence ? 'config' : 'default',
            value: imageSequence,
        };
    },
    setConfig: (value) => {
        imageSequence = value;
    },
    type: false,
    id: cliFlag,
};
