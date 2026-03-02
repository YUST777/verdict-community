"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowRenderButton = void 0;
const show_browser_rendering_1 = require("./show-browser-rendering");
const shouldShowRenderButton = (readOnlyStudio) => {
    if (readOnlyStudio) {
        return show_browser_rendering_1.SHOW_BROWSER_RENDERING;
    }
    return true;
};
exports.shouldShowRenderButton = shouldShowRenderButton;
