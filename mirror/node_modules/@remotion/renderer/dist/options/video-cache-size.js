"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaCacheSizeInBytesOption = exports.getMediaCacheSizeInBytes = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let mediaCacheSizeInBytes = null;
const getMediaCacheSizeInBytes = () => {
    return mediaCacheSizeInBytes;
};
exports.getMediaCacheSizeInBytes = getMediaCacheSizeInBytes;
const cliFlag = 'media-cache-size-in-bytes';
exports.mediaCacheSizeInBytesOption = {
    name: '@remotion/media cache size',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Specify the maximum size of the cache that ",
            jsx_runtime_1.jsx("code", { children: "<Video>" }),
            " and", ' ', jsx_runtime_1.jsx("code", { children: "<Audio>" }),
            " from ",
            jsx_runtime_1.jsx("code", { children: "@remotion/media" }),
            " may use combined, in bytes. ",
            jsx_runtime_1.jsx("br", {}),
            "The default is half of the available system memory when the render starts."] })),
    ssrName: 'mediaCacheSizeInBytes',
    docLink: 'https://www.remotion.dev/docs/media/video#setting-the-cache-size',
    type: 0,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (mediaCacheSizeInBytes !== null) {
            return {
                source: 'config',
                value: mediaCacheSizeInBytes,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (size) => {
        mediaCacheSizeInBytes = size !== null && size !== void 0 ? size : null;
    },
    id: cliFlag,
};
