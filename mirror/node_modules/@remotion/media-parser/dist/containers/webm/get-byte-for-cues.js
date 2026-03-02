"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByteForSeek = void 0;
const truthy_1 = require("../../truthy");
const all_segments_1 = require("./segments/all-segments");
const getByteForSeek = ({ seekHeadSegment, offset, }) => {
    const value = seekHeadSegment.value
        .map((v) => {
        if (v.type !== 'Seek') {
            return null;
        }
        const seekId = v.value.find((_v) => {
            // cues
            return _v.type === 'SeekID' && _v.value === all_segments_1.matroskaElements.Cues;
        });
        if (!seekId) {
            return null;
        }
        const seekPosition = v.value.find((_v) => {
            return _v.type === 'SeekPosition';
        });
        if (!seekPosition) {
            return false;
        }
        return seekPosition.value;
    })
        .filter(truthy_1.truthy);
    if (value.length === 0) {
        return null;
    }
    return value[0].value + offset;
};
exports.getByteForSeek = getByteForSeek;
