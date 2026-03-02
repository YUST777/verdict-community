"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodecSpecificData = void 0;
const create_avcc_1 = require("../trak/mdia/minf/stbl/stsd/create-avcc");
const create_hvcc_1 = require("../trak/mdia/minf/stbl/stsd/create-hvcc");
const create_pasp_1 = require("../trak/mdia/minf/stbl/stsd/create-pasp");
const avc1_1 = require("./avc1");
const hvc1_1 = require("./hvc1");
const mp4a_1 = require("./mp4a");
const createCodecSpecificData = (track) => {
    if (track.type === 'video') {
        if (track.codec === 'h264') {
            // May not have it initially
            if (!track.codecPrivate) {
                return new Uint8Array([]);
            }
            return (0, avc1_1.createAvc1Data)({
                avccBox: (0, create_avcc_1.createAvccBox)(track.codecPrivate),
                compressorName: 'WebCodecs',
                depth: 24,
                horizontalResolution: 72,
                verticalResolution: 72,
                height: track.height,
                width: track.width,
                pasp: (0, create_pasp_1.createPasp)(1, 1),
                type: 'avc1-data',
            });
        }
        if (track.codec === 'h265') {
            // May not have it initially
            if (!track.codecPrivate) {
                return new Uint8Array([]);
            }
            return (0, hvc1_1.createHvc1Data)({
                hvccBox: (0, create_hvcc_1.createHvccBox)(track.codecPrivate),
                compressorName: 'WebCodecs',
                depth: 24,
                horizontalResolution: 72,
                verticalResolution: 72,
                height: track.height,
                width: track.width,
                pasp: (0, create_pasp_1.createPasp)(1, 1),
                type: 'hvc1-data',
            });
        }
        throw new Error('Unsupported codec specific data ' + track.codec);
    }
    if (track.type === 'audio') {
        return (0, mp4a_1.createMp4a)({
            type: 'mp4a-data',
            // TODO: Put in values based on real data,
            // this seems to work though
            avgBitrate: 128 * 1024,
            maxBitrate: 128 * 1024,
            channelCount: track.numberOfChannels,
            sampleRate: track.sampleRate,
            codecPrivate: track.codecPrivate,
        });
    }
    throw new Error('Unsupported codec specific data ' + track);
};
exports.createCodecSpecificData = createCodecSpecificData;
