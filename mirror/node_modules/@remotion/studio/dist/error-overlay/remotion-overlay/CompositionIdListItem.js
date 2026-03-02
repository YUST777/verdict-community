"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionIdListItem = exports.listItemHoverStyle = exports.listItemActiveStyle = exports.listItemStyle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const colors_1 = require("../../helpers/colors");
exports.listItemStyle = {
    padding: 8,
    cursor: 'pointer',
    borderRadius: 4,
    lineHeight: 1.4,
    color: colors_1.TEXT_COLOR,
    fontFamily: 'inherit',
    fontSize: 14,
};
exports.listItemActiveStyle = {
    backgroundColor: colors_1.SELECTED_BACKGROUND,
};
exports.listItemHoverStyle = {
    backgroundColor: colors_1.CLEAR_HOVER,
};
const CompositionIdListItem = ({ id, isActive, onSelect }) => {
    const [hover, setHover] = react_1.default.useState(false);
    return (jsx_runtime_1.jsx("div", { role: "button", onPointerEnter: () => setHover(true), onPointerLeave: () => setHover(false), onClick: () => onSelect(id), style: {
            ...exports.listItemStyle,
            ...(hover ? exports.listItemHoverStyle : {}),
            ...(isActive ? exports.listItemActiveStyle : {}),
        }, title: id, children: id }));
};
exports.CompositionIdListItem = CompositionIdListItem;
