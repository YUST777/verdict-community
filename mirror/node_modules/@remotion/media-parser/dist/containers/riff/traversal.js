"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStrhBox = exports.getStrlBoxes = exports.getAvihBox = exports.getHdlrBox = exports.isRiffAvi = void 0;
const isRiffAvi = (structure) => {
    return structure.boxes.some((box) => box.type === 'riff-header' && box.fileType === 'AVI');
};
exports.isRiffAvi = isRiffAvi;
const getHdlrBox = (structure) => {
    return structure.boxes.find((box) => box.type === 'list-box' && box.listType === 'hdrl');
};
exports.getHdlrBox = getHdlrBox;
const getAvihBox = (structure) => {
    const hdlrBox = (0, exports.getHdlrBox)(structure);
    if (!hdlrBox) {
        return null;
    }
    return hdlrBox.children.find((box) => box.type === 'avih-box');
};
exports.getAvihBox = getAvihBox;
const getStrlBoxes = (structure) => {
    const hdlrBox = (0, exports.getHdlrBox)(structure);
    if (!hdlrBox) {
        return [];
    }
    return hdlrBox.children.filter((box) => box.type === 'list-box' && box.listType === 'strl');
};
exports.getStrlBoxes = getStrlBoxes;
const getStrhBox = (strlBoxChildren) => {
    return strlBoxChildren.find((box) => box.type === 'strh-box');
};
exports.getStrhBox = getStrhBox;
