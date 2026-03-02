"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatroskaSeekHead = void 0;
const matroska_utils_1 = require("./matroska-utils");
const createMatroskaSeekHead = (seeks) => {
    return (0, matroska_utils_1.padMatroskaBytes)((0, matroska_utils_1.makeMatroskaBytes)({
        type: 'SeekHead',
        minVintWidth: null,
        value: seeks.map((seek) => {
            return {
                type: 'Seek',
                minVintWidth: null,
                value: [
                    {
                        type: 'SeekID',
                        minVintWidth: null,
                        value: seek.hexString,
                    },
                    {
                        type: 'SeekPosition',
                        minVintWidth: null,
                        value: {
                            value: seek.byte,
                            byteLength: null,
                        },
                    },
                ],
            };
        }),
    }), 200);
};
exports.createMatroskaSeekHead = createMatroskaSeekHead;
