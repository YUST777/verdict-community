"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOpenGlRenderer = exports.glOption = exports.setChromiumOpenGlRenderer = exports.getChromiumOpenGlRenderer = exports.DEFAULT_OPENGL_RENDERER = exports.validOpenGlRenderers = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
exports.validOpenGlRenderers = [
    'swangle',
    'angle',
    'egl',
    'swiftshader',
    'vulkan',
    'angle-egl',
];
exports.DEFAULT_OPENGL_RENDERER = null;
let openGlRenderer = exports.DEFAULT_OPENGL_RENDERER;
const getChromiumOpenGlRenderer = () => openGlRenderer;
exports.getChromiumOpenGlRenderer = getChromiumOpenGlRenderer;
const setChromiumOpenGlRenderer = (renderer) => {
    (0, exports.validateOpenGlRenderer)(renderer);
    openGlRenderer = renderer;
};
exports.setChromiumOpenGlRenderer = setChromiumOpenGlRenderer;
const AngleChangelog = () => {
    return (jsx_runtime_1.jsxs("details", { style: { fontSize: '0.9em', marginBottom: '1em' }, children: [
            jsx_runtime_1.jsx("summary", { children: "Changelog" }), jsx_runtime_1.jsxs("ul", { children: [
                    jsx_runtime_1.jsxs("li", { children: ["From Remotion v2.6.7 until v3.0.7, the default for Remotion Lambda was", ' ', jsx_runtime_1.jsx("code", { children: "swiftshader" }),
                            ", but from v3.0.8 the default is", ' ', jsx_runtime_1.jsx("code", { children: "swangle" }),
                            " (Swiftshader on Angle) since Chrome 101 added support for it."] }), jsx_runtime_1.jsxs("li", { children: ["From Remotion v2.4.3 until v2.6.6, the default was ",
                            jsx_runtime_1.jsx("code", { children: "angle" }),
                            ", however it turns out to have a small memory leak that could crash long Remotion renders."] })
                ] })
        ] }));
};
const cliFlag = 'gl';
exports.glOption = {
    cliFlag,
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--gl',
    name: 'OpenGL renderer',
    type: 'angle',
    ssrName: 'gl',
    description: () => {
        return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                jsx_runtime_1.jsx(AngleChangelog, {}), jsx_runtime_1.jsxs("p", { children: ["Select the OpenGL renderer backend for Chromium. ",
                        jsx_runtime_1.jsx("br", {}),
                        "Accepted values:"] }), jsx_runtime_1.jsxs("ul", { children: [
                        jsx_runtime_1.jsx("li", { children: jsx_runtime_1.jsx("code", { children: '"angle"' }) }), jsx_runtime_1.jsx("li", { children: jsx_runtime_1.jsx("code", { children: '"egl"' }) }), jsx_runtime_1.jsx("li", { children: jsx_runtime_1.jsx("code", { children: '"swiftshader"' }) }), jsx_runtime_1.jsx("li", { children: jsx_runtime_1.jsx("code", { children: '"swangle"' }) }), jsx_runtime_1.jsxs("li", { children: [
                                jsx_runtime_1.jsx("code", { children: '"vulkan"' }),
                                " (",
                                jsx_runtime_1.jsx("em", { children: "from Remotion v4.0.41" }),
                                ")"] }), jsx_runtime_1.jsxs("li", { children: [
                                jsx_runtime_1.jsx("code", { children: '"angle-egl"' }),
                                " (",
                                jsx_runtime_1.jsx("em", { children: "from Remotion v4.0.51" }),
                                ")"] })
                    ] }), jsx_runtime_1.jsxs("p", { children: ["The default is ",
                        jsx_runtime_1.jsx("code", { children: "null" }),
                        ", letting Chrome decide, except on Lambda where the default is ",
                        jsx_runtime_1.jsx("code", { children: '"swangle"' })
                    ] })
            ] }));
    },
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag]) {
            (0, exports.validateOpenGlRenderer)(commandLine[cliFlag]);
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        if (openGlRenderer !== exports.DEFAULT_OPENGL_RENDERER) {
            return {
                value: openGlRenderer,
                source: 'config',
            };
        }
        return {
            value: exports.DEFAULT_OPENGL_RENDERER,
            source: 'default',
        };
    },
    setConfig: (value) => {
        (0, exports.validateOpenGlRenderer)(value);
        openGlRenderer = value;
    },
    id: cliFlag,
};
const validateOpenGlRenderer = (option) => {
    if (option === null) {
        return null;
    }
    if (!exports.validOpenGlRenderers.includes(option)) {
        throw new TypeError(`${option} is not a valid GL backend. Accepted values: ${exports.validOpenGlRenderers.join(', ')}`);
    }
    return option;
};
exports.validateOpenGlRenderer = validateOpenGlRenderer;
