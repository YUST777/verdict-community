"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboardShortcutsOption = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
let keyboardShortcutsEnabled = true;
const cliFlag = 'disable-keyboard-shortcuts';
exports.keyboardShortcutsOption = {
    name: 'Disable or Enable keyboard shortcuts',
    cliFlag,
    description: () => (jsx_runtime_1.jsx(jsx_runtime_1.Fragment, { children: "Enable or disable keyboard shortcuts in the Remotion Studio." })),
    ssrName: null,
    docLink: 'https://www.remotion.dev/docs/config#setkeyboardshortcutsenabled',
    type: false,
    getValue: ({ commandLine }) => {
        if (commandLine[cliFlag] !== undefined) {
            keyboardShortcutsEnabled = commandLine[cliFlag] === false;
            return {
                value: keyboardShortcutsEnabled,
                source: 'cli',
            };
        }
        return {
            value: keyboardShortcutsEnabled,
            source: 'config',
        };
    },
    setConfig(value) {
        keyboardShortcutsEnabled = value;
    },
    id: cliFlag,
};
