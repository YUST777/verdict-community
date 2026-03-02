"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disallowForwardSeekIfSamplesAreNeeded = void 0;
const need_samples_for_fields_1 = require("./state/need-samples-for-fields");
const disallowForwardSeekIfSamplesAreNeeded = ({ seekTo, previousPosition, fields, }) => {
    const fieldsNeedingSamples = Object.entries(fields)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .filter((key) => need_samples_for_fields_1.fieldsNeedSamplesMap[key]);
    if (fieldsNeedingSamples.length > 0) {
        throw new Error(`Forward seeking is not allowed when the following fields are requested from parseMedia(): ${fieldsNeedingSamples.join(', ')}. Seek was from 0x${previousPosition.toString(16)} to 0x${seekTo.toString(16)}. Either don't seek forward, or don't request these fields.`);
    }
};
exports.disallowForwardSeekIfSamplesAreNeeded = disallowForwardSeekIfSamplesAreNeeded;
