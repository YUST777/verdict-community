"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastKeyFrameBeforeTimeInSeconds = exports.makeObservedPesHeader = void 0;
const handle_avc_packet_1 = require("../../containers/transport-stream/handle-avc-packet");
const makeObservedPesHeader = () => {
    const pesHeaders = [];
    const confirmedAsKeyframe = [];
    const addPesHeader = (pesHeader) => {
        if (pesHeaders.find((p) => p.offset === pesHeader.offset)) {
            return;
        }
        pesHeaders.push(pesHeader);
    };
    const markPtsAsKeyframe = (pts) => {
        confirmedAsKeyframe.push(pts);
    };
    const getPesKeyframeHeaders = () => {
        return pesHeaders.filter((p) => confirmedAsKeyframe.includes(p.pts));
    };
    const setPesKeyframesFromSeekingHints = (hints) => {
        for (const pesHeader of hints.observedPesHeaders) {
            addPesHeader(pesHeader);
            markPtsAsKeyframe(pesHeader.pts);
        }
    };
    const state = {
        pesHeaders,
        addPesHeader,
        markPtsAsKeyframe,
        getPesKeyframeHeaders,
        setPesKeyframesFromSeekingHints,
    };
    return state;
};
exports.makeObservedPesHeader = makeObservedPesHeader;
const getLastKeyFrameBeforeTimeInSeconds = ({ observedPesHeaders, timeInSeconds, ptsStartOffset, }) => {
    return observedPesHeaders.findLast((k) => (k.pts - ptsStartOffset) / handle_avc_packet_1.MPEG_TIMESCALE <= timeInSeconds);
};
exports.getLastKeyFrameBeforeTimeInSeconds = getLastKeyFrameBeforeTimeInSeconds;
