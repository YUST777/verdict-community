"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasHdr = exports.getIsHdr = void 0;
const get_tracks_1 = require("./get-tracks");
const isVideoTrackHdr = (track) => {
    return (track.advancedColor.matrix === 'bt2020-ncl' &&
        (track.advancedColor.transfer === 'hlg' ||
            track.advancedColor.transfer === 'pq') &&
        track.advancedColor.primaries === 'bt2020');
};
const getIsHdr = (state) => {
    const tracks = (0, get_tracks_1.getTracks)(state, true);
    return tracks.some((track) => track.type === 'video' && isVideoTrackHdr(track));
};
exports.getIsHdr = getIsHdr;
const hasHdr = (state) => {
    return (0, get_tracks_1.getHasTracks)(state, true);
};
exports.hasHdr = hasHdr;
