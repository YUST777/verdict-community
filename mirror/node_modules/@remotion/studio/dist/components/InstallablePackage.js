"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallablePackageComp = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../helpers/colors");
const FONT_SIZE = 13;
const InstallablePackageComp = ({ isInstalled, pkg, link, description }) => {
    return (jsx_runtime_1.jsxs("div", { style: {
            fontSize: FONT_SIZE,
            lineHeight: 1.2,
            paddingBottom: 4,
            paddingTop: 4,
        }, children: [
            jsx_runtime_1.jsx("a", { href: link, style: {
                    fontSize: FONT_SIZE,
                    color: colors_1.TEXT_COLOR,
                    textDecoration: 'none',
                }, target: "_blank", children: pkg }), ' ', isInstalled ? (jsx_runtime_1.jsx("span", { style: { opacity: 0.3, fontSize: 'inherit' }, children: "(installed)" })) : null, jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsx("span", { style: { color: colors_1.LIGHT_TEXT, fontSize: FONT_SIZE }, children: description })
        ] }));
};
exports.InstallablePackageComp = InstallablePackageComp;
