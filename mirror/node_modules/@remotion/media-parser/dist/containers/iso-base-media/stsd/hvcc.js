"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHvcc = void 0;
const make_hvc1_codec_strings_1 = require("../../../make-hvc1-codec-strings");
const parseHvcc = ({ data, size, offset, }) => {
    const privateData = data.getSlice(size - 8);
    data.counter.decrement(size - 8);
    const constraintString = (0, make_hvc1_codec_strings_1.getHvc1CodecString)(data);
    const remaining = size - (data.counter.getOffset() - offset);
    data.discard(remaining);
    return {
        type: 'hvcc-box',
        privateData,
        configurationString: constraintString,
    };
};
exports.parseHvcc = parseHvcc;
