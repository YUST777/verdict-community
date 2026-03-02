"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalFooterContainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const content = {
    padding: 12,
    paddingRight: 12,
    flex: 1,
    fontSize: 13,
    minWidth: 500,
};
const ModalFooterContainer = ({ children }) => {
    return (jsx_runtime_1.jsx("div", { style: { ...content, borderTop: '1px solid black' }, children: children }));
};
exports.ModalFooterContainer = ModalFooterContainer;
