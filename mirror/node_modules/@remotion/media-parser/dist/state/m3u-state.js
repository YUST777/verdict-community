"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.m3uState = void 0;
const sample_sorter_1 = require("../containers/m3u/sample-sorter");
const log_1 = require("../log");
const m3uState = (logLevel) => {
    let selectedMainPlaylist = null;
    let associatedPlaylists = null;
    const hasEmittedVideoTrack = {};
    const hasEmittedAudioTrack = {};
    const hasEmittedDoneWithTracks = {};
    let hasFinishedManifest = false;
    const seekToSecondsToProcess = {};
    const nextSeekShouldSubtractChunks = {};
    let readyToIterateOverM3u = false;
    const allChunksProcessed = {};
    const m3uStreamRuns = {};
    const tracksDone = {};
    const getMainPlaylistUrl = () => {
        if (!selectedMainPlaylist) {
            throw new Error('No main playlist selected');
        }
        const playlistUrl = selectedMainPlaylist.type === 'initial-url'
            ? selectedMainPlaylist.url
            : selectedMainPlaylist.stream.src;
        return playlistUrl;
    };
    const getSelectedPlaylists = () => {
        return [
            getMainPlaylistUrl(),
            ...(associatedPlaylists !== null && associatedPlaylists !== void 0 ? associatedPlaylists : []).map((p) => p.src),
        ];
    };
    const getAllChunksProcessedForPlaylist = (src) => allChunksProcessed[src];
    const mp4HeaderSegments = {};
    const setMp4HeaderSegment = (playlistUrl, structure) => {
        mp4HeaderSegments[playlistUrl] = structure;
    };
    const getMp4HeaderSegment = (playlistUrl) => {
        return mp4HeaderSegments[playlistUrl];
    };
    return {
        setSelectedMainPlaylist: (stream) => {
            selectedMainPlaylist = stream;
        },
        getSelectedMainPlaylist: () => selectedMainPlaylist,
        setHasEmittedVideoTrack: (src, callback) => {
            hasEmittedVideoTrack[src] = callback;
        },
        hasEmittedVideoTrack: (src) => {
            const value = hasEmittedVideoTrack[src];
            if (value === undefined) {
                return false;
            }
            return value;
        },
        setHasEmittedAudioTrack: (src, callback) => {
            hasEmittedAudioTrack[src] = callback;
        },
        hasEmittedAudioTrack: (src) => {
            const value = hasEmittedAudioTrack[src];
            if (value === undefined) {
                return false;
            }
            return value;
        },
        setHasEmittedDoneWithTracks: (src) => {
            hasEmittedDoneWithTracks[src] = true;
        },
        hasEmittedDoneWithTracks: (src) => hasEmittedDoneWithTracks[src] !== undefined,
        setReadyToIterateOverM3u: () => {
            readyToIterateOverM3u = true;
        },
        isReadyToIterateOverM3u: () => readyToIterateOverM3u,
        setAllChunksProcessed: (src) => {
            allChunksProcessed[src] = true;
        },
        clearAllChunksProcessed: () => {
            Object.keys(allChunksProcessed).forEach((key) => {
                delete allChunksProcessed[key];
            });
        },
        getAllChunksProcessedForPlaylist,
        getAllChunksProcessedOverall: () => {
            if (!selectedMainPlaylist) {
                return false;
            }
            const selectedPlaylists = getSelectedPlaylists();
            return selectedPlaylists.every((url) => allChunksProcessed[url]);
        },
        setHasFinishedManifest: () => {
            hasFinishedManifest = true;
        },
        hasFinishedManifest: () => hasFinishedManifest,
        setM3uStreamRun: (playlistUrl, run) => {
            if (!run) {
                delete m3uStreamRuns[playlistUrl];
                return;
            }
            m3uStreamRuns[playlistUrl] = run;
        },
        setTracksDone: (playlistUrl) => {
            tracksDone[playlistUrl] = true;
            const selectedPlaylists = getSelectedPlaylists();
            return selectedPlaylists.every((url) => tracksDone[url]);
        },
        getTrackDone: (playlistUrl) => {
            return tracksDone[playlistUrl];
        },
        clearTracksDone: () => {
            Object.keys(tracksDone).forEach((key) => {
                delete tracksDone[key];
            });
        },
        getM3uStreamRun: (playlistUrl) => { var _a; return (_a = m3uStreamRuns[playlistUrl]) !== null && _a !== void 0 ? _a : null; },
        abortM3UStreamRuns: () => {
            const values = Object.values(m3uStreamRuns);
            if (values.length === 0) {
                return;
            }
            log_1.Log.trace(logLevel, `Aborting ${values.length} M3U stream runs`);
            values.forEach((run) => {
                run.abort();
            });
        },
        setAssociatedPlaylists: (playlists) => {
            associatedPlaylists = playlists;
        },
        getAssociatedPlaylists: () => associatedPlaylists,
        getSelectedPlaylists,
        sampleSorter: (0, sample_sorter_1.sampleSorter)({ logLevel, getAllChunksProcessedForPlaylist }),
        setMp4HeaderSegment,
        getMp4HeaderSegment,
        setSeekToSecondsToProcess: (playlistUrl, m3uSeek) => {
            seekToSecondsToProcess[playlistUrl] = m3uSeek;
        },
        getSeekToSecondsToProcess: (playlistUrl) => { var _a; return (_a = seekToSecondsToProcess[playlistUrl]) !== null && _a !== void 0 ? _a : null; },
        setNextSeekShouldSubtractChunks: (playlistUrl, chunks) => {
            nextSeekShouldSubtractChunks[playlistUrl] = chunks;
        },
        getNextSeekShouldSubtractChunks: (playlistUrl) => { var _a; return (_a = nextSeekShouldSubtractChunks[playlistUrl]) !== null && _a !== void 0 ? _a : 0; },
    };
};
exports.m3uState = m3uState;
