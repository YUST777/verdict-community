"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerTimeLabel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const format_time_1 = require("./format-time");
const PlayerTimeLabel = ({ durationInFrames, maxTimeLabelWidth, fps }) => {
    const frame = remotion_1.Internals.Timeline.useTimelinePosition();
    const timeLabel = (0, react_1.useMemo)(() => {
        return {
            color: 'white',
            fontFamily: 'sans-serif',
            fontSize: 14,
            maxWidth: maxTimeLabelWidth === null ? undefined : maxTimeLabelWidth,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        };
    }, [maxTimeLabelWidth]);
    // If the video ended and is not looping, it should show 0:04 / 0:04 instead of 0:03 / 0:04
    const isLastFrame = frame === durationInFrames - 1;
    const frameToDisplay = isLastFrame ? frame + 1 : frame;
    return (jsx_runtime_1.jsxs("div", { style: timeLabel, children: [(0, format_time_1.formatTime)(frameToDisplay / fps), " / ", (0, format_time_1.formatTime)(durationInFrames / fps)] }));
};
exports.PlayerTimeLabel = PlayerTimeLabel;
