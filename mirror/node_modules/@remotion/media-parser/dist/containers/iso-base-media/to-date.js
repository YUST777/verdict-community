"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUnixTimestamp = void 0;
const toUnixTimestamp = (value) => {
    if (value === 0) {
        return null;
    }
    const baseDate = new Date('1904-01-01T00:00:00Z');
    return Math.floor(value + baseDate.getTime() / 1000) * 1000;
};
exports.toUnixTimestamp = toUnixTimestamp;
