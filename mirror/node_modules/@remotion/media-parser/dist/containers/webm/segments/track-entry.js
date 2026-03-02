"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackTypeToString = void 0;
const trackTypeToString = (trackType) => {
    switch (trackType) {
        case 1:
            return 'video';
        case 2:
            return 'audio';
        case 3:
            return 'complex';
        case 4:
            return 'subtitle';
        case 5:
            return 'button';
        case 6:
            return 'control';
        case 7:
            return 'metadata';
        default:
            throw new Error(`Unknown track type: ${trackType}`);
    }
};
exports.trackTypeToString = trackTypeToString;
