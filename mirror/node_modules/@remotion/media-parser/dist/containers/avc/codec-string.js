"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodecStringFromSpsAndPps = void 0;
const getCodecStringFromSpsAndPps = (sps) => {
    return `avc1.${sps.spsData.profile.toString(16).padStart(2, '0')}${sps.spsData.compatibility.toString(16).padStart(2, '0')}${sps.spsData.level.toString(16).padStart(2, '0')}`;
};
exports.getCodecStringFromSpsAndPps = getCodecStringFromSpsAndPps;
