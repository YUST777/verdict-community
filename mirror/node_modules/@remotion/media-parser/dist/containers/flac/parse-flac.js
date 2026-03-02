"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFlac = void 0;
const skip_1 = require("../../skip");
const may_skip_video_data_1 = require("../../state/may-skip-video-data");
const parse_flac_frame_1 = require("./parse-flac-frame");
const parse_header_1 = require("./parse-header");
const parse_meta_1 = require("./parse-meta");
const parseFlac = ({ iterator, state, }) => {
    const mediaSectionState = state.mediaSection.isCurrentByteInMediaSection(iterator);
    if (mediaSectionState === 'in-section') {
        if ((0, may_skip_video_data_1.maySkipVideoData)({ state })) {
            return Promise.resolve((0, skip_1.makeSkip)(state.contentLength));
        }
        return (0, parse_flac_frame_1.parseFlacFrame)({ state, iterator });
    }
    const bytes = iterator.getByteString(4, true);
    if (bytes === 'fLaC') {
        return (0, parse_header_1.parseFlacHeader)({ state, iterator });
    }
    iterator.counter.decrement(4);
    // https://www.rfc-editor.org/rfc/rfc9639.html#name-streaminfo
    // section 8.1
    return (0, parse_meta_1.parseMetaBlock)({
        iterator,
        state,
    });
};
exports.parseFlac = parseFlac;
