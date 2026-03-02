"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRendererExperimentalBadge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../../helpers/colors");
const ValidationMessage_1 = require("../NewComposition/ValidationMessage");
const row = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
};
const text = {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: colors_1.LIGHT_TEXT,
};
const icon = {
    width: 14,
    height: 14,
    flexShrink: 0,
    fill: colors_1.WARNING_COLOR,
    marginRight: 8,
};
const link = {
    color: 'inherit',
    textDecoration: 'underline',
    fontSize: 14,
};
const WebRendererExperimentalBadge = () => {
    return (jsx_runtime_1.jsxs("div", { style: row, children: [
            jsx_runtime_1.jsx(ValidationMessage_1.WarningTriangle, { type: "warning", style: icon }), jsx_runtime_1.jsxs("div", { style: text, children: ["The Remotion Web Renderer is experimental.", ' ', jsx_runtime_1.jsx("a", { href: "https://github.com/remotion-dev/remotion/issues/5913", target: "_blank", rel: "noopener noreferrer", style: link, children: "Track progress on GitHub" }), ' ', "and discuss in the", ' ', jsx_runtime_1.jsx("a", { href: "https://remotion.dev/discord", target: "_blank", rel: "noopener noreferrer", style: link, children: "#web-renderer" }), ' ', "channel on Discord."] })
        ] }));
};
exports.WebRendererExperimentalBadge = WebRendererExperimentalBadge;
