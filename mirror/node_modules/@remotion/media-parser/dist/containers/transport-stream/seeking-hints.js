"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSeekingHintsForTransportStream = exports.getSeekingHintsFromTransportStream = void 0;
const getSeekingHintsFromTransportStream = (transportStream, tracksState) => {
    const firstVideoTrack = tracksState
        .getTracks()
        .find((t) => t.type === 'video');
    if (!firstVideoTrack) {
        return null;
    }
    return {
        type: 'transport-stream-seeking-hints',
        observedPesHeaders: transportStream.observedPesHeaders.getPesKeyframeHeaders(),
        ptsStartOffset: transportStream.startOffset.getOffset(firstVideoTrack.trackId),
        firstVideoTrackId: firstVideoTrack.trackId,
    };
};
exports.getSeekingHintsFromTransportStream = getSeekingHintsFromTransportStream;
const setSeekingHintsForTransportStream = ({ hints, state, }) => {
    state.transportStream.observedPesHeaders.setPesKeyframesFromSeekingHints(hints);
    state.transportStream.startOffset.setOffset({
        trackId: hints.firstVideoTrackId,
        newOffset: hints.ptsStartOffset,
    });
};
exports.setSeekingHintsForTransportStream = setSeekingHintsForTransportStream;
