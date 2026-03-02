"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterManifestFetch = void 0;
const log_1 = require("../../log");
const fetch_m3u8_stream_1 = require("./fetch-m3u8-stream");
const get_streams_1 = require("./get-streams");
const select_stream_1 = require("./select-stream");
const afterManifestFetch = async ({ structure, m3uState, src, selectM3uStreamFn, logLevel, selectAssociatedPlaylistsFn, readerInterface, onAudioTrack, canSkipTracks, }) => {
    const independentSegments = (0, get_streams_1.isIndependentSegments)(structure);
    const streams = (0, get_streams_1.getM3uStreams)({ structure, originalSrc: src, readerInterface });
    // Handle single media playlists (not master playlists):
    // 1. If !independentSegments: Old-style single playlist without segment independence
    // 2. If streams === null: Single media playlist (has EXT-X-INDEPENDENT-SEGMENTS but no EXT-X-STREAM-INF)
    // Both cases should iterate over the current URL as the media playlist
    if (!independentSegments || streams === null) {
        if (!src) {
            throw new Error('No src');
        }
        m3uState.setSelectedMainPlaylist({
            type: 'initial-url',
            url: src,
        });
        return m3uState.setReadyToIterateOverM3u();
    }
    const selectedPlaylist = await (0, select_stream_1.selectStream)({ streams, fn: selectM3uStreamFn });
    if (!selectedPlaylist.dimensions) {
        throw new Error('Stream does not have a resolution');
    }
    m3uState.setSelectedMainPlaylist({
        type: 'selected-stream',
        stream: selectedPlaylist,
    });
    const skipAudioTracks = onAudioTrack === null && canSkipTracks.doFieldsNeedTracks() === false;
    const associatedPlaylists = await (0, select_stream_1.selectAssociatedPlaylists)({
        playlists: selectedPlaylist.associatedPlaylists,
        fn: selectAssociatedPlaylistsFn,
        skipAudioTracks,
    });
    m3uState.setAssociatedPlaylists(associatedPlaylists);
    const playlistUrls = [
        selectedPlaylist.src,
        ...associatedPlaylists.map((p) => p.src),
    ];
    const struc = await Promise.all(playlistUrls.map(async (url) => {
        log_1.Log.verbose(logLevel, `Fetching playlist ${url}`);
        const boxes = await (0, fetch_m3u8_stream_1.fetchM3u8Stream)({ url, readerInterface });
        return {
            type: 'm3u-playlist',
            boxes,
            src: url,
        };
    }));
    structure.boxes.push(...struc);
    m3uState.setReadyToIterateOverM3u();
};
exports.afterManifestFetch = afterManifestFetch;
