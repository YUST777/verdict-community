"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPlayPauseButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const BufferingIndicator_js_1 = require("./BufferingIndicator.js");
const icons_js_1 = require("./icons.js");
const DefaultPlayPauseButton = ({ playing, buffering }) => {
    if (playing && buffering) {
        return jsx_runtime_1.jsx(BufferingIndicator_js_1.BufferingIndicator, { type: "player" });
    }
    if (playing) {
        return jsx_runtime_1.jsx(icons_js_1.PauseIcon, {});
    }
    return jsx_runtime_1.jsx(icons_js_1.PlayIcon, {});
};
exports.DefaultPlayPauseButton = DefaultPlayPauseButton;
