"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMatroskaInfo = void 0;
const make_duration_with_padding_1 = require("./make-duration-with-padding");
const matroska_utils_1 = require("./matroska-utils");
const makeMatroskaInfo = ({ timescale }) => {
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Info',
        value: [
            {
                type: 'TimestampScale',
                value: {
                    value: timescale,
                    byteLength: null,
                },
                minVintWidth: null,
            },
            {
                type: 'MuxingApp',
                value: '@remotion/webcodecs',
                minVintWidth: null,
            },
            {
                type: 'WritingApp',
                value: '@remotion/webcodecs',
                minVintWidth: null,
            },
            (0, make_duration_with_padding_1.makeDurationWithPadding)(0),
        ],
        minVintWidth: null,
    });
};
exports.makeMatroskaInfo = makeMatroskaInfo;
