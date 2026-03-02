"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineSequence = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../../helpers/colors");
const get_timeline_sequence_layout_1 = require("../../helpers/get-timeline-sequence-layout");
const timeline_layout_1 = require("../../helpers/timeline-layout");
const use_max_media_duration_1 = require("../../helpers/use-max-media-duration");
const AudioWaveform_1 = require("../AudioWaveform");
const LoopedTimelineIndicators_1 = require("./LoopedTimelineIndicators");
const TimelineSequenceFrame_1 = require("./TimelineSequenceFrame");
const TimelineVideoInfo_1 = require("./TimelineVideoInfo");
const TimelineWidthProvider_1 = require("./TimelineWidthProvider");
const AUDIO_GRADIENT = 'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)';
const VIDEO_GRADIENT = 'linear-gradient(to top, #8e44ad, #9b59b6)';
const TimelineSequence = ({ s }) => {
    const windowWidth = (0, react_1.useContext)(TimelineWidthProvider_1.TimelineWidthContext);
    if (windowWidth === null) {
        return null;
    }
    return jsx_runtime_1.jsx(Inner, { windowWidth: windowWidth, s: s });
};
exports.TimelineSequence = TimelineSequence;
const Inner = ({ s, windowWidth }) => {
    // If a duration is 1, it is essentially a still and it should have width 0
    // Some compositions may not be longer than their media duration,
    // if that is the case, it needs to be asynchronously determined
    var _a, _b, _c;
    const video = remotion_1.Internals.useVideo();
    const maxMediaDuration = (0, use_max_media_duration_1.useMaxMediaDuration)(s, (_a = video === null || video === void 0 ? void 0 : video.fps) !== null && _a !== void 0 ? _a : 30);
    if (!video) {
        throw new TypeError('Expected video config');
    }
    const frame = (0, remotion_1.useCurrentFrame)();
    const relativeFrame = frame - s.from;
    const relativeFrameWithPremount = relativeFrame + ((_b = s.premountDisplay) !== null && _b !== void 0 ? _b : 0);
    const relativeFrameWithPostmount = relativeFrame - s.duration;
    const roundedFrame = Math.round(relativeFrame * 100) / 100;
    const isInRange = relativeFrame >= 0 && relativeFrame < s.duration;
    const isPremounting = relativeFrameWithPremount >= 0 &&
        relativeFrameWithPremount < s.duration &&
        !isInRange;
    const isPostmounting = relativeFrameWithPostmount >= 0 &&
        relativeFrameWithPostmount < ((_c = s.postmountDisplay) !== null && _c !== void 0 ? _c : 0) &&
        !isInRange;
    const { marginLeft, width, naturalWidth, premountWidth, postmountWidth } = (0, react_1.useMemo)(() => {
        return (0, get_timeline_sequence_layout_1.getTimelineSequenceLayout)({
            durationInFrames: s.loopDisplay
                ? s.loopDisplay.durationInFrames * s.loopDisplay.numberOfTimes
                : s.duration,
            startFrom: s.loopDisplay ? s.from + s.loopDisplay.startOffset : s.from,
            startFromMedia: s.type === 'sequence' ? 0 : s.startMediaFrom,
            maxMediaDuration,
            video,
            windowWidth,
            premountDisplay: s.premountDisplay,
            postmountDisplay: s.postmountDisplay,
        });
    }, [maxMediaDuration, s, video, windowWidth]);
    const style = (0, react_1.useMemo)(() => {
        return {
            background: s.type === 'audio'
                ? AUDIO_GRADIENT
                : s.type === 'video'
                    ? VIDEO_GRADIENT
                    : colors_1.BLUE,
            border: get_timeline_sequence_layout_1.SEQUENCE_BORDER_WIDTH + 'px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            position: 'absolute',
            height: (0, timeline_layout_1.getTimelineLayerHeight)(s.type === 'video' ? 'video' : 'other'),
            marginLeft,
            width,
            color: 'white',
            overflow: 'hidden',
            opacity: isInRange ? 1 : 0.5,
        };
    }, [isInRange, marginLeft, s.type, width]);
    if (maxMediaDuration === null) {
        return null;
    }
    return (jsx_runtime_1.jsxs("div", { style: style, title: s.displayName, children: [premountWidth ? (jsx_runtime_1.jsx("div", { style: {
                    width: premountWidth,
                    height: '100%',
                    background: `repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 2px,
							rgba(255, 255, 255, ${isPremounting ? 0.5 : 0.2}) 4px
						)`,
                    position: 'absolute',
                } })) : null, postmountWidth ? (jsx_runtime_1.jsx("div", { style: {
                    width: postmountWidth,
                    height: '100%',
                    background: `repeating-linear-gradient(
							-45deg,
							transparent,
							transparent 2px,
							rgba(255, 255, 255, ${isPostmounting ? 0.5 : 0.2}) 2px,
							rgba(255, 255, 255, ${isPostmounting ? 0.5 : 0.2}) 4px
						)`,
                    position: 'absolute',
                    right: 0,
                } })) : null, s.type === 'audio' ? (jsx_runtime_1.jsx(AudioWaveform_1.AudioWaveform, { src: s.src, doesVolumeChange: s.doesVolumeChange, visualizationWidth: width, startFrom: s.startMediaFrom, durationInFrames: s.duration, volume: s.volume, playbackRate: s.playbackRate })) : null, s.type === 'video' ? (jsx_runtime_1.jsx(TimelineVideoInfo_1.TimelineVideoInfo, { src: s.src, visualizationWidth: width, naturalWidth: naturalWidth, trimBefore: s.startMediaFrom, durationInFrames: s.duration, playbackRate: s.playbackRate })) : null, s.loopDisplay === undefined ? null : (jsx_runtime_1.jsx(LoopedTimelineIndicators_1.LoopedTimelineIndicator, { loops: s.loopDisplay.numberOfTimes })), s.type !== 'audio' &&
                s.type !== 'video' &&
                s.loopDisplay === undefined &&
                (isInRange || isPremounting || isPostmounting) ? (jsx_runtime_1.jsx("div", { style: {
                    paddingLeft: 5 + (premountWidth !== null && premountWidth !== void 0 ? premountWidth : 0),
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }, children: jsx_runtime_1.jsx(TimelineSequenceFrame_1.TimelineSequenceFrame, { premounted: isPremounting, postmounted: isPostmounting ? s.duration - 1 : null, roundedFrame: roundedFrame }) })) : null] }, s.id));
};
