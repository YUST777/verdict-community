"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeData = void 0;
const normalizeData = (filteredData) => {
    const max = Math.max(...filteredData);
    const multiplier = max === 0 ? 0 : max ** -1;
    return filteredData.map((n) => n * multiplier);
};
exports.normalizeData = normalizeData;
