"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPdf = void 0;
const detect_file_type_1 = require("./detect-file-type");
const isPdf = (data) => {
    if (data.length < 4) {
        return null;
    }
    const pdfPattern = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    return (0, detect_file_type_1.matchesPattern)(pdfPattern)(data.subarray(0, 4)) ? { type: 'pdf' } : null;
};
exports.isPdf = isPdf;
