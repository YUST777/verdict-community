"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClusterSegment = exports.getPrivateData = exports.getBitDepth = exports.getNumberOfChannels = exports.getSampleRate = exports.getAudioSegment = exports.getVideoSegment = exports.getTimescaleSegment = exports.getTrackWithUid = exports.getTracksSegment = exports.getDisplayWidthSegment = exports.getHeightSegment = exports.getWidthSegment = exports.getTrackTypeSegment = exports.getDisplayHeightSegment = exports.getRangeSegment = exports.getPrimariesSegment = exports.getMatrixCoefficientsSegment = exports.getTransferCharacteristicsSegment = exports.getColourSegment = exports.getCodecSegment = exports.getTrackId = exports.getTrackByNumber = exports.getTrackTimestampScale = exports.getTrackCodec = exports.getTrackNumber = exports.getMainSegment = void 0;
const getMainSegment = (segments) => {
    var _a;
    return ((_a = segments.find((s) => s.type === 'Segment')) !== null && _a !== void 0 ? _a : null);
};
exports.getMainSegment = getMainSegment;
const getTrackNumber = (track) => {
    var _a;
    const child = track.value.find((b) => b.type === 'TrackNumber');
    return (_a = child === null || child === void 0 ? void 0 : child.value) !== null && _a !== void 0 ? _a : null;
};
exports.getTrackNumber = getTrackNumber;
const getTrackCodec = (track) => {
    const child = track.value.find((b) => b.type === 'CodecID');
    return child !== null && child !== void 0 ? child : null;
};
exports.getTrackCodec = getTrackCodec;
const getTrackTimestampScale = (track) => {
    const child = track.value.find((b) => b.type === 'TrackTimestampScale');
    if (!child) {
        return null;
    }
    if (child.type !== 'TrackTimestampScale') {
        throw new Error('Expected TrackTimestampScale');
    }
    return child.value;
};
exports.getTrackTimestampScale = getTrackTimestampScale;
const getTrackByNumber = (tracks, id) => {
    return tracks.find((track) => {
        const trackNumber = (0, exports.getTrackNumber)(track);
        return (trackNumber === null || trackNumber === void 0 ? void 0 : trackNumber.value) === id;
    });
};
exports.getTrackByNumber = getTrackByNumber;
const getTrackId = (track) => {
    const trackId = track.value.find((b) => b.type === 'TrackNumber');
    if (!trackId || trackId.type !== 'TrackNumber') {
        throw new Error('Expected track number segment');
    }
    return trackId.value.value;
};
exports.getTrackId = getTrackId;
const getCodecSegment = (track) => {
    const codec = track.value.find((b) => b.type === 'CodecID');
    if (!codec || codec.type !== 'CodecID') {
        return null;
    }
    return codec;
};
exports.getCodecSegment = getCodecSegment;
const getColourSegment = (track) => {
    const videoSegment = (0, exports.getVideoSegment)(track);
    if (!videoSegment) {
        return null;
    }
    const colour = videoSegment.value.find((b) => b.type === 'Colour');
    if (!colour || colour.type !== 'Colour') {
        return null;
    }
    return colour;
};
exports.getColourSegment = getColourSegment;
const getTransferCharacteristicsSegment = (color) => {
    if (!color || color.type !== 'Colour') {
        return null;
    }
    const box = color.value.find((b) => b.type === 'TransferCharacteristics');
    if (!box || box.type !== 'TransferCharacteristics') {
        return null;
    }
    return box;
};
exports.getTransferCharacteristicsSegment = getTransferCharacteristicsSegment;
const getMatrixCoefficientsSegment = (color) => {
    if (!color || color.type !== 'Colour') {
        return null;
    }
    const box = color.value.find((b) => b.type === 'MatrixCoefficients');
    if (!box || box.type !== 'MatrixCoefficients') {
        return null;
    }
    return box;
};
exports.getMatrixCoefficientsSegment = getMatrixCoefficientsSegment;
const getPrimariesSegment = (color) => {
    if (!color || color.type !== 'Colour') {
        return null;
    }
    const box = color.value.find((b) => b.type === 'Primaries');
    if (!box || box.type !== 'Primaries') {
        return null;
    }
    return box;
};
exports.getPrimariesSegment = getPrimariesSegment;
const getRangeSegment = (color) => {
    if (!color || color.type !== 'Colour') {
        return null;
    }
    const box = color.value.find((b) => b.type === 'Range');
    if (!box || box.type !== 'Range') {
        return null;
    }
    return box;
};
exports.getRangeSegment = getRangeSegment;
const getDisplayHeightSegment = (track) => {
    const videoSegment = (0, exports.getVideoSegment)(track);
    if (!videoSegment) {
        return null;
    }
    const displayHeight = videoSegment.value.find((b) => b.type === 'DisplayHeight');
    if (!displayHeight || displayHeight.type !== 'DisplayHeight') {
        return null;
    }
    return displayHeight;
};
exports.getDisplayHeightSegment = getDisplayHeightSegment;
const getTrackTypeSegment = (track) => {
    const trackType = track.value.find((b) => b.type === 'TrackType');
    if (!trackType || trackType.type !== 'TrackType') {
        return null;
    }
    return trackType;
};
exports.getTrackTypeSegment = getTrackTypeSegment;
const getWidthSegment = (track) => {
    const videoSegment = (0, exports.getVideoSegment)(track);
    if (!videoSegment) {
        return null;
    }
    const width = videoSegment.value.find((b) => b.type === 'PixelWidth');
    if (!width || width.type !== 'PixelWidth') {
        return null;
    }
    return width;
};
exports.getWidthSegment = getWidthSegment;
const getHeightSegment = (track) => {
    const videoSegment = (0, exports.getVideoSegment)(track);
    if (!videoSegment) {
        return null;
    }
    const height = videoSegment.value.find((b) => b.type === 'PixelHeight');
    if (!height || height.type !== 'PixelHeight') {
        return null;
    }
    return height;
};
exports.getHeightSegment = getHeightSegment;
const getDisplayWidthSegment = (track) => {
    const videoSegment = (0, exports.getVideoSegment)(track);
    if (!videoSegment) {
        return null;
    }
    const displayWidth = videoSegment.value.find((b) => b.type === 'DisplayWidth');
    if (!displayWidth || displayWidth.type !== 'DisplayWidth') {
        return null;
    }
    return displayWidth;
};
exports.getDisplayWidthSegment = getDisplayWidthSegment;
const getTracksSegment = (segment) => {
    const tracksSegment = segment.value.find((b) => b.type === 'Tracks');
    if (!tracksSegment) {
        return null;
    }
    return tracksSegment;
};
exports.getTracksSegment = getTracksSegment;
const getTrackWithUid = (segment, trackUid) => {
    var _a, _b;
    const tracksSegment = (0, exports.getTracksSegment)(segment);
    if (!tracksSegment) {
        return null;
    }
    const trackEntries = tracksSegment.value.filter((t) => t.type === 'TrackEntry');
    const trackEntry = trackEntries.find((entry) => {
        return entry === null || entry === void 0 ? void 0 : entry.value.find((t) => t.type === 'TrackUID' && t.value === trackUid);
    });
    if (!trackEntry) {
        return null;
    }
    return ((_b = (_a = trackEntry.value.find((t) => t.type === 'TrackNumber')) === null || _a === void 0 ? void 0 : _a.value.value) !== null && _b !== void 0 ? _b : null);
};
exports.getTrackWithUid = getTrackWithUid;
const getTimescaleSegment = (segment) => {
    const infoSegment = segment.value.find((b) => b.type === 'Info');
    if (!infoSegment || infoSegment.type !== 'Info') {
        return null;
    }
    const timescale = infoSegment.value.find((b) => b.type === 'TimestampScale');
    if (!timescale || timescale.type !== 'TimestampScale') {
        return null;
    }
    return timescale;
};
exports.getTimescaleSegment = getTimescaleSegment;
const getVideoSegment = (track) => {
    const videoSegment = track.value.find((b) => b.type === 'Video');
    if (!videoSegment || videoSegment.type !== 'Video') {
        return null;
    }
    return videoSegment !== null && videoSegment !== void 0 ? videoSegment : null;
};
exports.getVideoSegment = getVideoSegment;
const getAudioSegment = (track) => {
    const audioSegment = track.value.find((b) => b.type === 'Audio');
    if (!audioSegment || audioSegment.type !== 'Audio') {
        return null;
    }
    return audioSegment !== null && audioSegment !== void 0 ? audioSegment : null;
};
exports.getAudioSegment = getAudioSegment;
const getSampleRate = (track) => {
    const audioSegment = (0, exports.getAudioSegment)(track);
    if (!audioSegment) {
        return null;
    }
    const samplingFrequency = audioSegment.value.find((b) => b.type === 'SamplingFrequency');
    if (!samplingFrequency || samplingFrequency.type !== 'SamplingFrequency') {
        return null;
    }
    return samplingFrequency.value.value;
};
exports.getSampleRate = getSampleRate;
const getNumberOfChannels = (track) => {
    const audioSegment = (0, exports.getAudioSegment)(track);
    if (!audioSegment) {
        throw new Error('Could not find audio segment');
    }
    const channels = audioSegment.value.find((b) => b.type === 'Channels');
    if (!channels || channels.type !== 'Channels') {
        return 1;
    }
    return channels.value.value;
};
exports.getNumberOfChannels = getNumberOfChannels;
const getBitDepth = (track) => {
    const audioSegment = (0, exports.getAudioSegment)(track);
    if (!audioSegment) {
        return null;
    }
    const bitDepth = audioSegment.value.find((b) => b.type === 'BitDepth');
    if (!bitDepth || bitDepth.type !== 'BitDepth') {
        return null;
    }
    return bitDepth.value.value;
};
exports.getBitDepth = getBitDepth;
const getPrivateData = (track) => {
    const privateData = track.value.find((b) => b.type === 'CodecPrivate');
    if (!privateData || privateData.type !== 'CodecPrivate') {
        return null;
    }
    return privateData.value;
};
exports.getPrivateData = getPrivateData;
const getClusterSegment = (segment) => {
    const clusterSegment = segment.value.find((b) => b.type === 'Cluster');
    return clusterSegment !== null && clusterSegment !== void 0 ? clusterSegment : null;
};
exports.getClusterSegment = getClusterSegment;
