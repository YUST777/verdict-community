"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoCodecString = exports.getIsoBmColrConfig = exports.getVideoPrivateData = exports.hasVideoCodec = exports.getVideoCodec = void 0;
const color_1 = require("./containers/avc/color");
const av1_codec_private_1 = require("./containers/webm/av1-codec-private");
const get_sample_aspect_ratio_1 = require("./get-sample-aspect-ratio");
const get_tracks_1 = require("./get-tracks");
const getVideoCodec = (state) => {
    var _a, _b;
    const track = (0, get_tracks_1.getTracks)(state, true);
    return (_b = (_a = track.find((t) => t.type === 'video')) === null || _a === void 0 ? void 0 : _a.codecEnum) !== null && _b !== void 0 ? _b : null;
};
exports.getVideoCodec = getVideoCodec;
const hasVideoCodec = (state) => {
    return (0, get_tracks_1.getHasTracks)(state, true);
};
exports.hasVideoCodec = hasVideoCodec;
const getVideoPrivateData = (trakBox) => {
    const videoSample = (0, get_sample_aspect_ratio_1.getStsdVideoConfig)(trakBox);
    const avccBox = (0, get_sample_aspect_ratio_1.getAvccBox)(trakBox);
    const hvccBox = (0, get_sample_aspect_ratio_1.getHvccBox)(trakBox);
    const av1cBox = (0, get_sample_aspect_ratio_1.getAv1CBox)(trakBox);
    if (!videoSample) {
        return null;
    }
    if (avccBox) {
        return { type: 'avc-sps-pps', data: avccBox.privateData };
    }
    if (hvccBox) {
        return { type: 'hvcc-data', data: hvccBox.privateData };
    }
    if (av1cBox) {
        return { type: 'av1c-data', data: av1cBox.privateData };
    }
    return null;
};
exports.getVideoPrivateData = getVideoPrivateData;
const getIsoBmColrConfig = (trakBox) => {
    const videoSample = (0, get_sample_aspect_ratio_1.getStsdVideoConfig)(trakBox);
    if (!videoSample) {
        return null;
    }
    const colrAtom = (0, get_sample_aspect_ratio_1.getColrBox)(videoSample);
    if (!colrAtom) {
        return null;
    }
    // TODO: Not doing anything with a in ICC color profile yet
    if (colrAtom.colorType !== 'transfer-characteristics') {
        return null;
    }
    // https://github.com/bbc/qtff-parameter-editor
    return {
        fullRange: colrAtom.fullRangeFlag,
        matrix: (0, color_1.getMatrixCoefficientsFromIndex)(colrAtom.matrixIndex),
        primaries: (0, color_1.getPrimariesFromIndex)(colrAtom.primaries),
        transfer: (0, color_1.getTransferCharacteristicsFromIndex)(colrAtom.transfer),
    };
};
exports.getIsoBmColrConfig = getIsoBmColrConfig;
const getVideoCodecString = (trakBox) => {
    const videoSample = (0, get_sample_aspect_ratio_1.getStsdVideoConfig)(trakBox);
    const avccBox = (0, get_sample_aspect_ratio_1.getAvccBox)(trakBox);
    if (!videoSample) {
        return null;
    }
    if (avccBox) {
        return `${videoSample.format}.${avccBox.configurationString}`;
    }
    const hvccBox = (0, get_sample_aspect_ratio_1.getHvccBox)(trakBox);
    if (hvccBox) {
        return `${videoSample.format}.${hvccBox.configurationString}`;
    }
    const av1cBox = (0, get_sample_aspect_ratio_1.getAv1CBox)(trakBox);
    if (av1cBox) {
        const colrAtom = (0, get_sample_aspect_ratio_1.getColrBox)(videoSample);
        return (0, av1_codec_private_1.parseAv1PrivateData)(av1cBox.privateData, colrAtom);
    }
    const vpccBox = (0, get_sample_aspect_ratio_1.getVpccBox)(trakBox);
    if (vpccBox) {
        return `${videoSample.format}.${vpccBox.codecString}`;
    }
    return videoSample.format;
};
exports.getVideoCodecString = getVideoCodecString;
