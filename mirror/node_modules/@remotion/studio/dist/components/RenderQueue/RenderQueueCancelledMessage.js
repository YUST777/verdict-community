"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueCancelledMessage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../../helpers/colors");
const item_style_1 = require("./item-style");
const cancelledStyle = {
    ...item_style_1.renderQueueItemSubtitleStyle,
    color: colors_1.LIGHT_TEXT,
    cursor: 'default',
};
const RenderQueueCancelledMessage = () => {
    return jsx_runtime_1.jsx("span", { style: cancelledStyle, children: "Cancelled" });
};
exports.RenderQueueCancelledMessage = RenderQueueCancelledMessage;
