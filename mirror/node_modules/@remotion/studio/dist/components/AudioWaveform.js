"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioWaveform = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const media_utils_1 = require("@remotion/media-utils");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../helpers/colors");
const timeline_layout_1 = require("../helpers/timeline-layout");
const AudioWaveformBar_1 = require("./AudioWaveformBar");
const container = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
    height: (0, timeline_layout_1.getTimelineLayerHeight)('other'),
};
const errorMessage = {
    fontSize: 13,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    alignSelf: 'flex-start',
    maxWidth: 450,
    opacity: 0.75,
};
const canvasStyle = {
    position: 'absolute',
};
const AudioWaveform = ({ src, startFrom, durationInFrames, visualizationWidth, volume, doesVolumeChange, playbackRate, }) => {
    const [metadata, setMetadata] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const mountState = (0, react_1.useRef)({ isMounted: true });
    const vidConf = remotion_1.Internals.useUnsafeVideoConfig();
    if (vidConf === null) {
        throw new Error('Expected video config');
    }
    const canvas = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const { current } = mountState;
        current.isMounted = true;
        return () => {
            current.isMounted = false;
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (!canvas.current) {
            return;
        }
        const context = canvas.current.getContext('2d');
        if (!context) {
            return;
        }
        context.clearRect(0, 0, visualizationWidth, (0, timeline_layout_1.getTimelineLayerHeight)('other'));
        if (!doesVolumeChange || typeof volume === 'number') {
            // The volume is a number, meaning it could change on each frame-
            // User did not use the (f: number) => number syntax, so we can't draw
            // a visualization.
            return;
        }
        const volumes = volume.split(',').map((v) => Number(v));
        context.beginPath();
        context.moveTo(0, (0, timeline_layout_1.getTimelineLayerHeight)('other'));
        volumes.forEach((v, index) => {
            const x = (index / (volumes.length - 1)) * visualizationWidth;
            const y = (1 - v) * ((0, timeline_layout_1.getTimelineLayerHeight)('other') - timeline_layout_1.TIMELINE_BORDER * 2) + 1;
            if (index === 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
        });
        context.strokeStyle = colors_1.LIGHT_TRANSPARENT;
        context.stroke();
    }, [visualizationWidth, metadata, startFrom, volume, doesVolumeChange]);
    (0, react_1.useEffect)(() => {
        setError(null);
        (0, media_utils_1.getAudioData)(src)
            .then((data) => {
            if (mountState.current.isMounted) {
                setMetadata(data);
            }
        })
            .catch((err) => {
            if (mountState.current.isMounted) {
                setError(err);
            }
        });
    }, [src, vidConf.fps]);
    const normalized = (0, react_1.useMemo)(() => {
        if (!metadata || metadata.numberOfChannels === 0) {
            return [];
        }
        const numberOfSamples = Math.floor(visualizationWidth / (AudioWaveformBar_1.WAVEFORM_BAR_LENGTH + AudioWaveformBar_1.WAVEFORM_BAR_MARGIN));
        return (0, media_utils_1.getWaveformPortion)({
            audioData: metadata,
            startTimeInSeconds: startFrom / vidConf.fps,
            durationInSeconds: Math.min((durationInFrames / vidConf.fps) * playbackRate, metadata.durationInSeconds),
            numberOfSamples,
            normalize: false,
        });
    }, [
        durationInFrames,
        vidConf.fps,
        metadata,
        playbackRate,
        startFrom,
        visualizationWidth,
    ]);
    if (error) {
        return (jsx_runtime_1.jsx("div", { style: container, children: jsx_runtime_1.jsx("div", { style: errorMessage, children: "No waveform available. Audio might not support CORS." }) }));
    }
    if (!metadata) {
        return null;
    }
    return (jsx_runtime_1.jsxs("div", { style: container, children: [normalized.map((w) => {
                return (jsx_runtime_1.jsx(AudioWaveformBar_1.AudioWaveformBar, { amplitude: w.amplitude * (typeof volume === 'number' ? volume : 1) }, w.index));
            }), jsx_runtime_1.jsx("canvas", { ref: canvas, style: canvasStyle, width: visualizationWidth, height: (0, timeline_layout_1.getTimelineLayerHeight)('other') })
        ] }));
};
exports.AudioWaveform = AudioWaveform;
