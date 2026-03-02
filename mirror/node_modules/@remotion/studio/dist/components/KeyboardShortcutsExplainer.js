"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardShortcutsExplainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ShortcutHint_1 = require("../error-overlay/remotion-overlay/ShortcutHint");
const colors_1 = require("../helpers/colors");
const use_keybinding_1 = require("../helpers/use-keybinding");
const keys_1 = require("../icons/keys");
const layout_1 = require("./layout");
const left = {
    width: 85,
    paddingTop: 8,
    paddingBottom: 8,
};
const key = {
    background: colors_1.INPUT_BACKGROUND,
    padding: '3px 6px',
    color: 'white',
    borderRadius: 3,
    border: '1px solid ' + colors_1.INPUT_BORDER_COLOR_UNHOVERED,
    borderBottomWidth: 3,
    fontSize: 14,
    fontFamily: 'monospace',
};
const right = {
    fontSize: 14,
    color: '#eee',
};
const container = {
    paddingLeft: 20,
    paddingRight: 40,
    paddingTop: 10,
    paddingBottom: 10,
};
const title = {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
};
const keyboardShortcutsDisabled = {
    padding: 12,
    width: '100%',
    fontSize: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
};
const ul = {
    marginTop: 0,
    marginBottom: 0,
};
const li = {
    fontSize: 14,
};
const KeyboardShortcutsExplainer = () => {
    return (jsx_runtime_1.jsxs("div", { children: [(0, use_keybinding_1.areKeyboardShortcutsDisabled)() ? (jsx_runtime_1.jsxs("div", { style: keyboardShortcutsDisabled, children: ["Keyboard shortcuts disabled either due to:",
                    jsx_runtime_1.jsxs("ul", { style: ul, children: [
                            jsx_runtime_1.jsx("li", { style: li, children: "a) --disable-keyboard-shortcuts being passed" }), jsx_runtime_1.jsx("li", { style: li, children: "b) Config.setKeyboardShortcutsEnabled(false) being set or" }), jsx_runtime_1.jsx("li", { style: li, children: " c) a Remotion version mismatch." })
                        ] })
                ] })) : null, jsx_runtime_1.jsxs(layout_1.Row, { style: container, children: [
                    jsx_runtime_1.jsxs(layout_1.Column, { children: [
                            jsx_runtime_1.jsx("div", { style: title, children: "Playback" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ShiftIcon, {}) }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ArrowLeft, {}) })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "1 second back" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ArrowLeft, {}) }) }), jsx_runtime_1.jsx("div", { style: right, children: "Previous frame" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "Space" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Play / Pause" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ArrowRight, {}) }) }), jsx_runtime_1.jsx("div", { style: right, children: "Next frame" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ShiftIcon, {}) }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: jsx_runtime_1.jsx(keys_1.ArrowRight, {}) })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "1 second forward" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "A" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Jump to beginning" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "E" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Jump to end" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "J" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Reverse playback" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "K" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Pause" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "L" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Play / Speed up" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "G" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Go to frame" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "Enter" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Pause & return to playback start" })
                                ] }), jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "Sidebar" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "B" })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "Toggle left sidebar" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "J" })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "Toggle right sidebar" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "G" })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "Toggle both sidebars" })
                                ] }), jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "View" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "F" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Enter fullscreen" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "Esc" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Exit fullscreen" })
                                ] })
                        ] }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 8 }), jsx_runtime_1.jsxs(layout_1.Column, { children: [
                            jsx_runtime_1.jsx("div", { style: title, children: "Navigation" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "PageUp" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Previous composition" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "PageDown" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Next composition" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "R" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Render composition" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "T" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Toggle checkerboard background" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "?" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Show keyboard shortcuts" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "K" })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "Quick Switcher" })
                                ] }), jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "Playback range" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "I" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Set In Point" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "O" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Set Out Point" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "X" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Clear In/Out Points" })
                                ] }), jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "Zoom" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "+" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Zoom in" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "-" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Zoom out" })
                                ] }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsx("div", { style: left, children: jsx_runtime_1.jsx("kbd", { style: key, children: "0" }) }), jsx_runtime_1.jsx("div", { style: right, children: "Reset zoom" })
                                ] }), ' ', jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "Props Editor" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                    jsx_runtime_1.jsxs("div", { style: left, children: [
                                            jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "S" })
                                        ] }), jsx_runtime_1.jsx("div", { style: right, children: "Save" })
                                ] }), process.env.ASK_AI_ENABLED && (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                                    jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("div", { style: title, children: "AI" }), jsx_runtime_1.jsxs(layout_1.Row, { align: "center", children: [
                                            jsx_runtime_1.jsxs("div", { style: left, children: [
                                                    jsx_runtime_1.jsx("kbd", { style: key, children: ShortcutHint_1.cmdOrCtrlCharacter }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.3 }), jsx_runtime_1.jsx("kbd", { style: key, children: "I" })
                                                ] }), jsx_runtime_1.jsx("div", { style: right, children: "Ask AI" })
                                        ] })
                                ] }))] })
                ] })
        ] }));
};
exports.KeyboardShortcutsExplainer = KeyboardShortcutsExplainer;
