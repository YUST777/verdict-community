"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riffHasIndex = void 0;
const riffHasIndex = (structure) => {
    var _a, _b, _c;
    return ((_c = (_b = (_a = structure.boxes.find((b) => b.type === 'list-box' && b.listType === 'hdrl')) === null || _a === void 0 ? void 0 : _a.children.find((box) => box.type === 'avih-box')) === null || _b === void 0 ? void 0 : _b.hasIndex) !== null && _c !== void 0 ? _c : false);
};
exports.riffHasIndex = riffHasIndex;
