"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeVideoRotation = void 0;
const normalizeVideoRotation = (rotation) => {
    return ((rotation % 360) + 360) % 360;
};
exports.normalizeVideoRotation = normalizeVideoRotation;
