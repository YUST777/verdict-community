"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoColorFromSps = exports.getSampleAspectRatioFromSps = exports.getDimensionsFromSps = void 0;
const color_1 = require("./color");
const getDimensionsFromSps = (sps) => {
    var _a, _b, _c, _d;
    const height = sps.pic_height_in_map_units_minus1;
    const width = sps.pic_width_in_mbs_minus1;
    // https://stackoverflow.com/questions/12018535/get-the-width-height-of-the-video-from-h-264-nalu
    return {
        height: (height + 1) * 16 -
            ((_a = sps.frame_crop_bottom_offset) !== null && _a !== void 0 ? _a : 0) * 2 -
            ((_b = sps.frame_crop_top_offset) !== null && _b !== void 0 ? _b : 0) * 2,
        width: (width + 1) * 16 -
            ((_c = sps.frame_crop_right_offset) !== null && _c !== void 0 ? _c : 0) * 2 -
            ((_d = sps.frame_crop_left_offset) !== null && _d !== void 0 ? _d : 0) * 2,
    };
};
exports.getDimensionsFromSps = getDimensionsFromSps;
const getSampleAspectRatioFromSps = (sps) => {
    var _a;
    if (((_a = sps.vui_parameters) === null || _a === void 0 ? void 0 : _a.sar_height) && sps.vui_parameters.sar_width) {
        return {
            width: sps.vui_parameters.sar_width,
            height: sps.vui_parameters.sar_height,
        };
    }
    return {
        width: 1,
        height: 1,
    };
};
exports.getSampleAspectRatioFromSps = getSampleAspectRatioFromSps;
const getVideoColorFromSps = (sps) => {
    var _a, _b, _c, _d, _e;
    const matrixCoefficients = (_a = sps.vui_parameters) === null || _a === void 0 ? void 0 : _a.matrix_coefficients;
    const transferCharacteristics = (_b = sps.vui_parameters) === null || _b === void 0 ? void 0 : _b.transfer_characteristics;
    const colorPrimaries = (_c = sps.vui_parameters) === null || _c === void 0 ? void 0 : _c.colour_primaries;
    return {
        matrix: matrixCoefficients
            ? (0, color_1.getMatrixCoefficientsFromIndex)(matrixCoefficients)
            : null,
        transfer: transferCharacteristics
            ? (0, color_1.getTransferCharacteristicsFromIndex)(transferCharacteristics)
            : null,
        primaries: colorPrimaries ? (0, color_1.getPrimariesFromIndex)(colorPrimaries) : null,
        fullRange: (_e = (_d = sps.vui_parameters) === null || _d === void 0 ? void 0 : _d.video_full_range_flag) !== null && _e !== void 0 ? _e : null,
    };
};
exports.getVideoColorFromSps = getVideoColorFromSps;
