"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationFromM3u = void 0;
const get_playlist_1 = require("./get-playlist");
const getDurationFromM3u = (state) => {
    const playlists = (0, get_playlist_1.getAllPlaylists)({
        structure: state.structure.getM3uStructure(),
        src: state.src,
    });
    return Math.max(...playlists.map((p) => {
        return (0, get_playlist_1.getDurationFromPlaylist)(p);
    }));
};
exports.getDurationFromM3u = getDurationFromM3u;
