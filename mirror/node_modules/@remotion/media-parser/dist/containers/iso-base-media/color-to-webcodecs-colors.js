"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaParserAdvancedColorToWebCodecsColor = void 0;
const mediaParserAdvancedColorToWebCodecsColor = (color) => {
    return {
        transfer: color.transfer,
        matrix: color.matrix,
        primaries: color.primaries,
        fullRange: color.fullRange,
    };
};
exports.mediaParserAdvancedColorToWebCodecsColor = mediaParserAdvancedColorToWebCodecsColor;
