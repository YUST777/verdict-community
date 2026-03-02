"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runParseIteration = void 0;
const parse_aac_1 = require("./containers/aac/parse-aac");
const parse_flac_1 = require("./containers/flac/parse-flac");
const parse_boxes_1 = require("./containers/iso-base-media/parse-boxes");
const parse_m3u_1 = require("./containers/m3u/parse-m3u");
const parse_mp3_1 = require("./containers/mp3/parse-mp3");
const parse_riff_1 = require("./containers/riff/parse-riff");
const parse_transport_stream_1 = require("./containers/transport-stream/parse-transport-stream");
const parse_wav_1 = require("./containers/wav/parse-wav");
const parse_webm_header_1 = require("./containers/webm/parse-webm-header");
const init_video_1 = require("./init-video");
const runParseIteration = async ({ state, }) => {
    const structure = state.structure.getStructureOrNull();
    // m3u8 is busy parsing the chunks once the manifest has been read
    if (structure && structure.type === 'm3u') {
        return (0, parse_m3u_1.parseM3u)({ state });
    }
    if (structure === null) {
        await (0, init_video_1.initVideo)({
            state,
        });
        return null;
    }
    if (structure.type === 'riff') {
        return (0, parse_riff_1.parseRiff)(state);
    }
    if (structure.type === 'mp3') {
        return (0, parse_mp3_1.parseMp3)(state);
    }
    if (structure.type === 'iso-base-media') {
        return (0, parse_boxes_1.parseIsoBaseMedia)(state);
    }
    if (structure.type === 'matroska') {
        return (0, parse_webm_header_1.parseWebm)(state);
    }
    if (structure.type === 'transport-stream') {
        return (0, parse_transport_stream_1.parseTransportStream)(state);
    }
    if (structure.type === 'wav') {
        return (0, parse_wav_1.parseWav)(state);
    }
    if (structure.type === 'aac') {
        return (0, parse_aac_1.parseAac)(state);
    }
    if (structure.type === 'flac') {
        return (0, parse_flac_1.parseFlac)({ state, iterator: state.iterator });
    }
    return Promise.reject(new Error('Unknown video format ' + structure));
};
exports.runParseIteration = runParseIteration;
