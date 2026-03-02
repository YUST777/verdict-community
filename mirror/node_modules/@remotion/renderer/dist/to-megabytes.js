"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMegabytes = toMegabytes;
function toMegabytes(bytes) {
    const mb = bytes / 1024 / 1024;
    return `${Math.round(mb * 10) / 10} Mb`;
}
