"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisualControlEditedValue = void 0;
const getVisualControlEditedValue = ({ handles, key, }) => {
    var _a;
    var _b;
    // TODO: What if z.null()
    return (_b = (_a = handles === null || handles === void 0 ? void 0 : handles[key]) === null || _a === void 0 ? void 0 : _a.unsavedValue) !== null && _b !== void 0 ? _b : null;
};
exports.getVisualControlEditedValue = getVisualControlEditedValue;
