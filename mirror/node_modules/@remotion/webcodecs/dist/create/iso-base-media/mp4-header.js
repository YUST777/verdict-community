"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaddedMoovAtom = void 0;
const media_parser_1 = require("@remotion/media-parser");
const log_1 = require("../../log");
const create_ilst_1 = require("./create-ilst");
const create_moov_1 = require("./create-moov");
const create_mvhd_1 = require("./create-mvhd");
const create_udta_1 = require("./create-udta");
const header_length_1 = require("./header-length");
const create_cmt_1 = require("./ilst/create-cmt");
const create_too_1 = require("./ilst/create-too");
const primitives_1 = require("./primitives");
const serialize_track_1 = require("./serialize-track");
const create_meta_1 = require("./udta/create-meta");
const create_hdlr_1 = require("./udta/meta/create-hdlr");
const createPaddedMoovAtom = ({ durationInUnits, trackInfo, timescale, expectedDurationInSeconds, logLevel, expectedFrameRate, }) => {
    const headerLength = (0, header_length_1.calculateAReasonableMp4HeaderLength)({
        expectedDurationInSeconds,
        expectedFrameRate,
    });
    if (expectedDurationInSeconds !== null) {
        log_1.Log.verbose(logLevel, `Expecting duration of the video to be ${expectedDurationInSeconds} seconds, allocating ${headerLength} bytes for the MP4 header.`);
    }
    else {
        log_1.Log.verbose(logLevel, `No duration was provided, allocating ${headerLength} bytes for the MP4 header.`);
    }
    return (0, primitives_1.padIsoBaseMediaBytes)((0, create_moov_1.createMoov)({
        mvhd: (0, create_mvhd_1.createMvhd)({
            timescale,
            durationInUnits,
            matrix: primitives_1.IDENTITY_MATRIX,
            nextTrackId: trackInfo
                .map((t) => t.track.trackNumber)
                .reduce((a, b) => Math.max(a, b), 0) + 1,
            rate: 1,
            volume: 1,
            creationTime: Date.now(),
            modificationTime: Date.now(),
        }),
        traks: trackInfo.map((track) => {
            return (0, serialize_track_1.serializeTrack)({
                timescale,
                track: track.track,
                durationInUnits,
                samplePositions: track.samplePositions,
            });
        }),
        udta: (0, create_udta_1.createUdta)((0, create_meta_1.createMeta)({
            hdlr: (0, create_hdlr_1.createHdlr)('mdir'),
            ilst: (0, create_ilst_1.createIlst)([
                (0, create_too_1.createToo)('WebCodecs'),
                (0, create_cmt_1.createCmt)(`Made with @remotion/webcodecs ${media_parser_1.VERSION}`),
            ]),
        })),
    }), headerLength);
};
exports.createPaddedMoovAtom = createPaddedMoovAtom;
