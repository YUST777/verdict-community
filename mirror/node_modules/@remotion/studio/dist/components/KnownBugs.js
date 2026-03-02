"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownBugs = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const OpenIssueButton_1 = require("./UpdateModal/OpenIssueButton");
const container = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
};
const text = {
    fontSize: 14,
    flex: 1,
};
const KnownBugs = ({ bugs }) => {
    const bugElements = bugs.map((bug) => {
        return (jsx_runtime_1.jsxs("div", { style: container, children: [
                jsx_runtime_1.jsxs("div", { style: text, children: ["\uD83E\uDEB2 ", bug.title] }), jsx_runtime_1.jsx(OpenIssueButton_1.OpenIssueButton, { link: bug.link })
            ] }, bug.description + bug.link));
    });
    return jsx_runtime_1.jsx("div", { children: bugElements });
};
exports.KnownBugs = KnownBugs;
