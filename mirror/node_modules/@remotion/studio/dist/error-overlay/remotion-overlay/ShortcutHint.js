"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortcutHint = exports.cmdOrCtrlCharacter = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const use_keybinding_1 = require("../../helpers/use-keybinding");
exports.cmdOrCtrlCharacter = window.navigator.platform.startsWith('Mac')
    ? '⌘'
    : 'Ctrl';
const container = {
    display: 'inline-block',
    marginLeft: 6,
    opacity: 0.6,
    verticalAlign: 'middle',
    fontSize: 14,
};
const ShortcutHint = ({ keyToPress, cmdOrCtrl }) => {
    const style = (0, react_1.useMemo)(() => {
        if (keyToPress === '↵') {
            return {
                display: 'inline-block',
                transform: `translateY(2px)`,
                fontSize: 14,
            };
        }
        return {};
    }, [keyToPress]);
    if ((0, use_keybinding_1.areKeyboardShortcutsDisabled)()) {
        return null;
    }
    return (jsx_runtime_1.jsxs("span", { style: container, children: [cmdOrCtrl ? `${exports.cmdOrCtrlCharacter}` : '', jsx_runtime_1.jsx("span", { style: style, children: keyToPress.toUpperCase() })
        ] }));
};
exports.ShortcutHint = ShortcutHint;
