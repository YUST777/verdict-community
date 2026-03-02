"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerInfoEmit = exports.emitAllInfo = void 0;
const emit_available_info_1 = require("./emit-available-info");
const has_all_info_1 = require("./has-all-info");
const emitAllInfo = async (state) => {
    // Force assign
    const allFields = Object.keys(state.fields).reduce((acc, key) => {
        var _a;
        if ((_a = state.fields) === null || _a === void 0 ? void 0 : _a[key]) {
            acc[key] = true;
        }
        return acc;
    }, {});
    await (0, emit_available_info_1.emitAvailableInfo)({
        hasInfo: allFields,
        state,
    });
};
exports.emitAllInfo = emitAllInfo;
const triggerInfoEmit = async (state) => {
    const availableInfo = (0, has_all_info_1.getAvailableInfo)({
        state,
    });
    await (0, emit_available_info_1.emitAvailableInfo)({
        hasInfo: availableInfo,
        state,
    });
};
exports.triggerInfoEmit = triggerInfoEmit;
