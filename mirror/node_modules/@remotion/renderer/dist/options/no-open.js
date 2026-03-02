"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noOpenOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let shouldOpenBrowser = true;
const cliFlag = 'no-open';
exports.noOpenOption = {
    name: 'Disable browser auto-open',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "If specified, Remotion will not open a browser window when starting the Studio." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/cli/studio#--no-open',
    type: false,
    getValue: ({ commandLine }) => {
        // Minimist quirk: `--no-open` sets `open` to `false`.
        // When no flag is passed, `open` is `undefined`.
        const cliValue = commandLine.open;
        if (cliValue === false) {
            return { value: true, source: 'cli' };
        }
        if (!shouldOpenBrowser) {
            return { value: true, source: 'config' };
        }
        return { value: false, source: 'default' };
    },
    setConfig: (shouldOpen) => {
        shouldOpenBrowser = shouldOpen;
    },
    id: cliFlag,
};
