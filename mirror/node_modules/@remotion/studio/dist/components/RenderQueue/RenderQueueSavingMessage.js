"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueSavingMessage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const item_style_1 = require("./item-style");
const savingStyle = {
    ...item_style_1.renderQueueItemSubtitleStyle,
    cursor: 'default',
};
const RenderQueueSavingMessage = () => {
    return jsx_runtime_1.jsx("span", { style: savingStyle, children: "Saving to out/..." });
};
exports.RenderQueueSavingMessage = RenderQueueSavingMessage;
