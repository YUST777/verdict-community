"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSelectM3uStreamFn = exports.selectStream = exports.defaultSelectM3uAssociatedPlaylists = exports.selectAssociatedPlaylists = void 0;
const selectAssociatedPlaylists = async ({ playlists, fn, skipAudioTracks, }) => {
    if (playlists.length < 1) {
        return Promise.resolve([]);
    }
    const streams = await fn({ associatedPlaylists: playlists });
    if (!Array.isArray(streams)) {
        throw new Error('Expected an array of associated playlists');
    }
    const selectedStreams = [];
    for (const stream of streams) {
        if (stream.isAudio && skipAudioTracks) {
            continue;
        }
        if (!playlists.find((playlist) => playlist.src === stream.src)) {
            throw new Error(`The associated playlist ${JSON.stringify(streams)} cannot be selected because it was not in the list of selectable playlists`);
        }
        selectedStreams.push(stream);
    }
    return selectedStreams;
};
exports.selectAssociatedPlaylists = selectAssociatedPlaylists;
const defaultSelectM3uAssociatedPlaylists = ({ associatedPlaylists }) => {
    if (associatedPlaylists.length === 1) {
        return associatedPlaylists;
    }
    return associatedPlaylists.filter((playlist) => playlist.default);
};
exports.defaultSelectM3uAssociatedPlaylists = defaultSelectM3uAssociatedPlaylists;
const selectStream = async ({ streams, fn, }) => {
    if (streams.length < 1) {
        throw new Error('No streams found');
    }
    const selectedStreamId = await fn({ streams });
    const selectedStream = streams.find((stream) => stream.id === selectedStreamId);
    if (!selectedStream) {
        throw new Error(`No stream with the id ${selectedStreamId} found`);
    }
    return Promise.resolve(selectedStream);
};
exports.selectStream = selectStream;
const defaultSelectM3uStreamFn = ({ streams }) => {
    return Promise.resolve(streams[0].id);
};
exports.defaultSelectM3uStreamFn = defaultSelectM3uStreamFn;
