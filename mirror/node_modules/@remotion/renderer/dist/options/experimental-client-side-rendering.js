"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.experimentalClientSideRenderingOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let experimentalClientSideRenderingEnabled = false;
const cliFlag = 'enable-experimental-client-side-rendering';
exports.experimentalClientSideRenderingOption = {
    name: 'Enable Experimental Client-Side Rendering',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Enable WIP client-side rendering in the Remotion Studio. See https://www.remotion.dev/docs/client-side-rendering/ for notes." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/client-side-rendering',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== null) {
            return {
                value: commandLine[cliFlag],
                source: 'cli',
            };
        }
        return {
            value: experimentalClientSideRenderingEnabled,
            source: 'config',
        };
    },
    setConfig(value) {
        experimentalClientSideRenderingEnabled = value;
    },
    id: cliFlag,
};
