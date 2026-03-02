"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByte = void 0;
const get_seeking_byte_1 = require("./containers/aac/get-seeking-byte");
const get_seeking_byte_2 = require("./containers/flac/get-seeking-byte");
const get_seeking_byte_3 = require("./containers/iso-base-media/get-seeking-byte");
const get_seeking_byte_4 = require("./containers/m3u/get-seeking-byte");
const get_seeking_byte_5 = require("./containers/mp3/get-seeking-byte");
const get_seeking_byte_6 = require("./containers/riff/get-seeking-byte");
const handle_avc_packet_1 = require("./containers/transport-stream/handle-avc-packet");
const get_seeking_byte_7 = require("./containers/wav/get-seeking-byte");
const get_seeking_byte_8 = require("./containers/webm/seek/get-seeking-byte");
const observed_pes_header_1 = require("./state/transport-stream/observed-pes-header");
const getSeekingByte = ({ info, time, logLevel, currentPosition, isoState, transportStream, webmState, mediaSection, m3uPlaylistContext, structure, riffState, m3uState, avcState, }) => {
    var _a;
    if (info.type === 'iso-base-media-seeking-hints') {
        return (0, get_seeking_byte_3.getSeekingByteFromIsoBaseMedia)({
            info,
            time,
            logLevel,
            currentPosition,
            isoState,
            structure,
            m3uPlaylistContext,
        });
    }
    if (info.type === 'wav-seeking-hints') {
        return (0, get_seeking_byte_7.getSeekingByteFromWav)({
            info,
            time,
        });
    }
    if (info.type === 'webm-seeking-hints') {
        return (0, get_seeking_byte_8.getSeekingByteFromMatroska)({
            info,
            time,
            webmState,
            logLevel,
            mediaSection,
        });
    }
    if (info.type === 'flac-seeking-hints') {
        const byte = (0, get_seeking_byte_2.getSeekingByteForFlac)({
            seekingHints: info,
            time,
        });
        if (byte) {
            return Promise.resolve({
                type: 'do-seek',
                byte: byte.offset,
                timeInSeconds: byte.timeInSeconds,
            });
        }
        return Promise.resolve({
            type: 'valid-but-must-wait',
        });
    }
    if (info.type === 'transport-stream-seeking-hints') {
        const lastKeyframeBeforeTimeInSeconds = (0, observed_pes_header_1.getLastKeyFrameBeforeTimeInSeconds)({
            observedPesHeaders: info.observedPesHeaders,
            timeInSeconds: time,
            ptsStartOffset: info.ptsStartOffset,
        });
        if (!lastKeyframeBeforeTimeInSeconds) {
            transportStream.resetBeforeSeek();
            return Promise.resolve({
                type: 'do-seek',
                byte: 0,
                timeInSeconds: 0,
            });
        }
        const byte = lastKeyframeBeforeTimeInSeconds.offset;
        transportStream.resetBeforeSeek();
        return Promise.resolve({
            type: 'do-seek',
            byte,
            timeInSeconds: Math.min(lastKeyframeBeforeTimeInSeconds.pts, (_a = lastKeyframeBeforeTimeInSeconds.dts) !== null && _a !== void 0 ? _a : Infinity) / handle_avc_packet_1.MPEG_TIMESCALE,
        });
    }
    if (info.type === 'riff-seeking-hints') {
        return (0, get_seeking_byte_6.getSeekingByteForRiff)({
            info,
            time,
            riffState,
            avcState,
        });
    }
    if (info.type === 'mp3-seeking-hints') {
        return Promise.resolve((0, get_seeking_byte_5.getSeekingByteForMp3)({
            info,
            time,
        }));
    }
    if (info.type === 'aac-seeking-hints') {
        return Promise.resolve((0, get_seeking_byte_1.getSeekingByteForAac)({
            time,
            seekingHints: info,
        }));
    }
    if (info.type === 'm3u8-seeking-hints') {
        return Promise.resolve((0, get_seeking_byte_4.getSeekingByteForM3u8)({
            time,
            currentPosition,
            m3uState,
            logLevel,
        }));
    }
    throw new Error(`Unknown seeking info type: ${info}`);
};
exports.getSeekingByte = getSeekingByte;
