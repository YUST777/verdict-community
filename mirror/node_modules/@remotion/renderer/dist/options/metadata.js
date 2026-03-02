"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let metadata = {};
const cliFlag = 'metadata';
exports.metadataOption = {
    name: 'Metadata',
    cliFlag,
    description: (mode) => {
        if (mode === 'ssr') {
            return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["An object containing metadata to be embedded in the video. See", ' ', jsx_runtime_1.jsx("a", { href: "/docs/metadata", children: "here" }),
                    " for which metadata is accepted."] }));
        }
        return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Metadata to be embedded in the video. See", ' ', jsx_runtime_1.jsx("a", { href: "/docs/metadata", children: "here" }),
                " for which metadata is accepted.",
                jsx_runtime_1.jsx("br", {}),
                "The parameter must be in the format of ",
                jsx_runtime_1.jsx("code", { children: "--metadata key=value" }), ' ', "and can be passed multiple times."] }));
    },
    docLink: 'https://www.remotion.dev/docs/metadata',
    type: {},
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            const val = commandLine[cliFlag];
            const array = typeof val === 'string' ? [val] : val;
            const keyValues = array.map((a) => {
                if (!a.includes('=')) {
                    throw new Error(`"metadata" must be in the format of key=value, but got ${a}`);
                }
                const splitted = a.split('=');
                if (splitted.length !== 2) {
                    throw new Error(`"metadata" must be in the format of key=value, but got ${a}`);
                }
                return [splitted[0], splitted[1]];
            });
            const value = Object.fromEntries(keyValues);
            return {
                source: 'config',
                value,
            };
        }
        return {
            source: 'config',
            value: metadata,
        };
    },
    setConfig: (newMetadata) => {
        metadata = newMetadata;
    },
    ssrName: 'metadata',
    id: cliFlag,
};
