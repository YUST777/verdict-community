"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseM3u = void 0;
const after_manifest_fetch_1 = require("./after-manifest-fetch");
const parse_m3u_manifest_1 = require("./parse-m3u-manifest");
const run_over_m3u_1 = require("./run-over-m3u");
const parseM3u = async ({ state }) => {
    const structure = state.structure.getM3uStructure();
    if (state.m3u.isReadyToIterateOverM3u()) {
        const selectedPlaylists = state.m3u.getSelectedPlaylists();
        const whichPlaylistToRunOver = state.m3u.sampleSorter.getNextStreamToRun(selectedPlaylists);
        await (0, run_over_m3u_1.runOverM3u)({
            state,
            structure,
            playlistUrl: whichPlaylistToRunOver,
            logLevel: state.logLevel,
        });
        return null;
    }
    if (state.m3u.hasFinishedManifest()) {
        if (typeof state.src !== 'string' && !(state.src instanceof URL)) {
            throw new Error('Expected src to be a string');
        }
        state.mediaSection.addMediaSection({
            start: 0,
            // We do a pseudo-seek when seeking m3u, which will be the same byte
            // as we are currently in, which in most cases is the end of the file.
            size: state.contentLength + 1,
        });
        await (0, after_manifest_fetch_1.afterManifestFetch)({
            structure,
            m3uState: state.m3u,
            src: state.src.toString(),
            selectM3uStreamFn: state.selectM3uStreamFn,
            logLevel: state.logLevel,
            selectAssociatedPlaylistsFn: state.selectM3uAssociatedPlaylistsFn,
            readerInterface: state.readerInterface,
            onAudioTrack: state.onAudioTrack,
            canSkipTracks: state.callbacks.canSkipTracksState,
        });
        return null;
    }
    const box = await (0, parse_m3u_manifest_1.parseM3uManifest)({
        iterator: state.iterator,
        structure,
        contentLength: state.contentLength,
    });
    const isDoneNow = state.iterator.counter.getOffset() === state.contentLength;
    if (isDoneNow) {
        state.m3u.setHasFinishedManifest();
    }
    return box;
};
exports.parseM3u = parseM3u;
