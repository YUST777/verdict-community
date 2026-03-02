"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areSamplesComplete = void 0;
const areSamplesComplete = ({ moofBoxes, tfraBoxes, }) => {
    if (moofBoxes.length === 0) {
        return true;
    }
    return (tfraBoxes.length > 0 &&
        tfraBoxes.every((t) => t.entries.length === moofBoxes.length));
};
exports.areSamplesComplete = areSamplesComplete;
