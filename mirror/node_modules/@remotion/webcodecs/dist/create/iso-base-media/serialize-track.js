"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTrack = void 0;
const create_codec_specific_data_1 = require("./codec-specific/create-codec-specific-data");
const create_mdia_1 = require("./create-mdia");
const create_trak_1 = require("./create-trak");
const create_mdhd_1 = require("./mdia/create-mdhd");
const primitives_1 = require("./primitives");
const create_tkhd_1 = require("./trak/create-tkhd");
const create_minf_1 = require("./trak/mdia/create-minf");
const create_smhd_1 = require("./trak/mdia/minf/create-smhd");
const create_stbl_1 = require("./trak/mdia/minf/create-stbl");
const create_vmhd_1 = require("./trak/mdia/minf/create-vmhd");
const create_hdlr_1 = require("./udta/meta/create-hdlr");
const serializeTrack = ({ track, durationInUnits, samplePositions, timescale, }) => {
    if (track.codec !== 'h264' &&
        track.codec !== 'h265' &&
        track.codec !== 'aac') {
        throw new Error('Currently only H.264 and AAC is supported');
    }
    return (0, create_trak_1.createTrak)({
        tkhd: track.codec === 'aac'
            ? (0, create_tkhd_1.createTkhdForAudio)({
                creationTime: Date.now(),
                flags: create_tkhd_1.TKHD_FLAGS.TRACK_ENABLED | create_tkhd_1.TKHD_FLAGS.TRACK_IN_MOVIE,
                modificationTime: Date.now(),
                duration: durationInUnits,
                trackId: track.trackNumber,
                volume: 1,
                timescale,
            })
            : track.type === 'video'
                ? (0, create_tkhd_1.createTkhdForVideo)({
                    creationTime: Date.now(),
                    modificationTime: Date.now(),
                    duration: durationInUnits,
                    flags: create_tkhd_1.TKHD_FLAGS.TRACK_ENABLED | create_tkhd_1.TKHD_FLAGS.TRACK_IN_MOVIE,
                    height: track.height,
                    width: track.width,
                    matrix: primitives_1.IDENTITY_MATRIX,
                    trackId: track.trackNumber,
                    volume: 0,
                    timescale,
                })
                : new Uint8Array((0, primitives_1.stringsToUint8Array)('wrong')),
        mdia: (0, create_mdia_1.createMdia)({
            mdhd: (0, create_mdhd_1.createMdhd)({
                creationTime: null,
                modificationTime: null,
                duration: durationInUnits,
                timescale: track.timescale,
            }),
            hdlr: track.type === 'video' ? (0, create_hdlr_1.createHdlr)('video') : (0, create_hdlr_1.createHdlr)('audio'),
            minf: (0, create_minf_1.createMinf)({
                stblAtom: (0, create_stbl_1.createStbl)({
                    samplePositions,
                    isVideo: track.type === 'video',
                    codecSpecificData: (0, create_codec_specific_data_1.createCodecSpecificData)(track),
                }),
                vmhdAtom: track.type === 'audio' ? (0, create_smhd_1.createSmhd)() : (0, create_vmhd_1.createVmhd)(),
            }),
        }),
    });
};
exports.serializeTrack = serializeTrack;
