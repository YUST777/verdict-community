"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodemodDiffPreview = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../../helpers/colors");
const CodemodDiffPreview = ({ status }) => {
    if (status.type === 'loading') {
        return null;
    }
    if (status.type === 'fail') {
        return (jsx_runtime_1.jsx("span", { style: { color: colors_1.FAIL_COLOR, fontSize: 13, lineHeight: 1.2 }, children: status.error }));
    }
    return (jsx_runtime_1.jsxs("div", { style: { lineHeight: 1.2 }, children: [
            jsx_runtime_1.jsx("span", { style: { color: colors_1.LIGHT_TEXT, fontSize: 13, lineHeight: 1.2 }, children: "This will edit your Root file." }), jsx_runtime_1.jsx("br", {}), jsx_runtime_1.jsxs("span", { style: { color: colors_1.BLUE, fontSize: 13, lineHeight: 1.2 }, children: [status.diff.additions, " addition", status.diff.additions === 1 ? '' : 's', ","] }), ' ', jsx_runtime_1.jsxs("span", { style: {
                    color: colors_1.SELECTED_GUIDE,
                    fontSize: 13,
                    lineHeight: 1.2,
                }, children: [status.diff.deletions, " deletion", status.diff.deletions === 1 ? '' : 's'] })
        ] }));
};
exports.CodemodDiffPreview = CodemodDiffPreview;
