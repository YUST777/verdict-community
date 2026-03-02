"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS = exports.offthreadVideoThreadsOption = exports.getOffthreadVideoThreads = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let value = null;
const getOffthreadVideoThreads = () => {
    return value;
};
exports.getOffthreadVideoThreads = getOffthreadVideoThreads;
const cliFlag = 'offthreadvideo-video-threads';
exports.offthreadVideoThreadsOption = {
    name: 'OffthreadVideo threads',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["The number of threads that",
            jsx_runtime_1.jsx("a", { href: "https://remotion.dev/docs/offthreadvideo", children: jsx_runtime_1.jsx("code", { children: "<OffthreadVideo>" }) }), ' ', "can start to extract frames. The default is", ' ', exports.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS, ". Increase carefully, as too many threads may cause instability."] })),
    ssrName: 'offthreadVideoThreads',
    docLink: 'https://www.remotion.dev/docs/offthreadvideo',
    type: 0,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: commandLine[cliFlag],
            };
        }
        if (value !== null) {
            return {
                source: 'config',
                value,
            };
        }
        return {
            source: 'default',
            value: null,
        };
    },
    setConfig: (size) => {
        value = size !== null && size !== void 0 ? size : null;
    },
    id: cliFlag,
};
exports.DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS = 2;
