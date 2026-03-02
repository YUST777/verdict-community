"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromUnixTimestamp = void 0;
const fromUnixTimestamp = (value) => {
    if (value === null) {
        return 0;
    }
    const baseDate = new Date('1904-01-01T00:00:00Z');
    return Math.floor(value / 1000 - baseDate.getTime() / 1000);
};
exports.fromUnixTimestamp = fromUnixTimestamp;
