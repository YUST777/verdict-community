"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationFromPlaylist = exports.getPlaylist = exports.getAllPlaylists = void 0;
const get_streams_1 = require("./get-streams");
const getAllPlaylists = ({ structure, src, }) => {
    const isIndependent = (0, get_streams_1.isIndependentSegments)(structure);
    if (!isIndependent) {
        return [
            {
                type: 'm3u-playlist',
                boxes: structure.boxes,
                src,
            },
        ];
    }
    const playlists = structure.boxes.filter((box) => box.type === 'm3u-playlist');
    // If no playlists found, this might be a single media playlist (not a master playlist)
    // Create a synthetic playlist from the structure boxes
    if (playlists.length === 0) {
        return [
            {
                type: 'm3u-playlist',
                boxes: structure.boxes,
                src,
            },
        ];
    }
    return playlists;
};
exports.getAllPlaylists = getAllPlaylists;
const getPlaylist = (structure, src) => {
    const allPlaylists = (0, exports.getAllPlaylists)({ structure, src });
    const playlists = allPlaylists.find((box) => box.src === src);
    if (!playlists) {
        throw new Error(`Expected m3u-playlist with src ${src}`);
    }
    return playlists;
};
exports.getPlaylist = getPlaylist;
const getDurationFromPlaylist = (playlist) => {
    const duration = playlist.boxes.filter((box) => box.type === 'm3u-extinf');
    if (duration.length === 0) {
        throw new Error('Expected duration in m3u playlist');
    }
    return duration.reduce((acc, d) => acc + d.value, 0);
};
exports.getDurationFromPlaylist = getDurationFromPlaylist;
