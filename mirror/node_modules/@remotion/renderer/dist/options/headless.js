"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headlessOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DEFAULT = true;
let headlessMode = DEFAULT;
const cliFlag = 'disable-headless';
exports.headlessOption = {
    name: 'Disable Headless Mode',
    cliFlag,
    description: () => (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: ["Deprecated - will be removed in 5.0.0. With the migration to", ' ', jsx_runtime_1.jsx("a", { href: "/docs/miscellaneous/chrome-headless-shell", children: "Chrome Headless Shell" }),
            ", this option is not functional anymore.",
            jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("br", {}),
            " If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode."] })),
    ssrName: 'headless',
    docLink: 'https://www.remotion.dev/docs/chromium-flags#--disable-headless',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            return {
                source: 'cli',
                value: !commandLine[cliFlag],
            };
        }
        if (headlessMode !== DEFAULT) {
            return {
                source: 'config',
                value: headlessMode,
            };
        }
        return {
            source: 'default',
            value: headlessMode,
        };
    },
    setConfig: (value) => {
        headlessMode = value;
    },
    id: cliFlag,
};
