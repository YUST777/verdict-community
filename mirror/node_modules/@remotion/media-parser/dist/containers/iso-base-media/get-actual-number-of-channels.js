"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualDecoderParameters = void 0;
const aac_codecprivate_1 = require("../../aac-codecprivate");
// Example video:	'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/riverside.mp4';
// This video has `numberOfChannels = 2`, but the actual number of channels is `1` according to Codec Private.
// Therefore, prioritizing Codec Private over `numberOfChannels`.
const getActualDecoderParameters = ({ audioCodec, codecPrivate, numberOfChannels, sampleRate, }) => {
    if (audioCodec !== 'aac') {
        return {
            numberOfChannels,
            sampleRate,
            codecPrivate,
        };
    }
    if (codecPrivate === null) {
        return { numberOfChannels, sampleRate, codecPrivate };
    }
    if (codecPrivate.type !== 'aac-config') {
        throw new Error('Expected AAC codec private data');
    }
    const parsed = (0, aac_codecprivate_1.parseAacCodecPrivate)(codecPrivate.data);
    const actual = (0, aac_codecprivate_1.createAacCodecPrivate)({
        ...parsed,
        codecPrivate: codecPrivate.data,
    });
    return {
        numberOfChannels: parsed.channelConfiguration,
        sampleRate: parsed.sampleRate,
        codecPrivate: { type: 'aac-config', data: actual },
    };
};
exports.getActualDecoderParameters = getActualDecoderParameters;
