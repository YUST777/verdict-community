"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performedSeeksStats = void 0;
const performedSeeksStats = () => {
    const performedSeeks = [];
    const markLastSeekAsUserInitiated = () => {
        if (performedSeeks.length > 0) {
            performedSeeks[performedSeeks.length - 1].type = 'user-initiated';
        }
    };
    return {
        recordSeek: (seek) => {
            performedSeeks.push(seek);
        },
        getPerformedSeeks: () => {
            return performedSeeks;
        },
        markLastSeekAsUserInitiated,
    };
};
exports.performedSeeksStats = performedSeeksStats;
