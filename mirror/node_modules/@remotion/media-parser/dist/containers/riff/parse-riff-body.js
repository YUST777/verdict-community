"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRiffBody = void 0;
const skip_1 = require("../../skip");
const may_skip_video_data_1 = require("../../state/may-skip-video-data");
const video_section_1 = require("../../state/video-section");
const convert_queued_sample_to_mediaparser_sample_1 = require("./convert-queued-sample-to-mediaparser-sample");
const expect_riff_box_1 = require("./expect-riff-box");
const parse_video_section_1 = require("./parse-video-section");
const parseRiffBody = async (state) => {
    const releasedFrame = state.riff.queuedBFrames.getReleasedFrame();
    if (releasedFrame) {
        const converted = (0, convert_queued_sample_to_mediaparser_sample_1.convertQueuedSampleToMediaParserSample)({
            sample: releasedFrame.sample,
            state,
            trackId: releasedFrame.trackId,
        });
        state.riff.sampleCounter.onVideoSample({
            trackId: releasedFrame.trackId,
            videoSample: converted,
        });
        await state.callbacks.onVideoSample({
            videoSample: converted,
            trackId: releasedFrame.trackId,
        });
        return null;
    }
    if (state.mediaSection.isCurrentByteInMediaSection(state.iterator) ===
        'in-section') {
        if ((0, may_skip_video_data_1.maySkipVideoData)({
            state,
        }) &&
            state.riff.getAvcProfile()) {
            const mediaSection = (0, video_section_1.getCurrentMediaSection)({
                offset: state.iterator.counter.getOffset(),
                mediaSections: state.mediaSection.getMediaSections(),
            });
            if (!mediaSection) {
                throw new Error('No video section defined');
            }
            // only skipping forward in query mode
            return Promise.resolve((0, skip_1.makeSkip)(mediaSection.start + mediaSection.size));
        }
        await (0, parse_video_section_1.parseMediaSection)(state);
        return null;
    }
    const box = await (0, expect_riff_box_1.expectRiffBox)({
        iterator: state.iterator,
        stateIfExpectingSideEffects: state,
    });
    if (box !== null) {
        await (0, expect_riff_box_1.postProcessRiffBox)(state, box);
        const structure = state.structure.getRiffStructure();
        structure.boxes.push(box);
    }
    return null;
};
exports.parseRiffBody = parseRiffBody;
