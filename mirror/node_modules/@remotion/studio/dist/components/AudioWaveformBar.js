"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioWaveformBar = exports.WAVEFORM_BAR_MARGIN = exports.WAVEFORM_BAR_LENGTH = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const timeline_layout_1 = require("../helpers/timeline-layout");
exports.WAVEFORM_BAR_LENGTH = 2;
exports.WAVEFORM_BAR_MARGIN = 1;
const container = {
    width: exports.WAVEFORM_BAR_LENGTH,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginLeft: exports.WAVEFORM_BAR_MARGIN,
    borderRadius: 2,
};
// Sonnet:
/**
 *
 * consider a sinus wave with an amplitude going from [-1, 1].
 * if we sample it infinitely, and convert all negative samples from negative to positive
 * what is the average of all samples?
 *
 * Answer: 2 / Math.PI = 0.6366
 */
const AudioWaveformBar = ({ amplitude }) => {
    const style = (0, react_1.useMemo)(() => {
        return {
            ...container,
            height: (0, timeline_layout_1.getTimelineLayerHeight)('other') * amplitude * (1 / 0.6366),
        };
    }, [amplitude]);
    return jsx_runtime_1.jsx("div", { style: style });
};
exports.AudioWaveformBar = AudioWaveformBar;
