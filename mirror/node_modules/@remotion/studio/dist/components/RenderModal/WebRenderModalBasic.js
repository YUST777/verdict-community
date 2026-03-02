"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRenderModalBasic = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Checkmark_1 = require("../../icons/Checkmark");
const layout_1 = require("../layout");
const ComboBox_1 = require("../NewComposition/ComboBox");
const InputDragger_1 = require("../NewComposition/InputDragger");
const RemInput_1 = require("../NewComposition/RemInput");
const SegmentedControl_1 = require("../SegmentedControl");
const FrameRangeSetting_1 = require("./FrameRangeSetting");
const human_readable_loglevel_1 = require("./human-readable-loglevel");
const layout_2 = require("./layout");
const OptionExplainerBubble_1 = require("./OptionExplainerBubble");
const RenderModalOutputName_1 = require("./RenderModalOutputName");
const tabContainer = {
    flex: 1,
};
const WebRenderModalBasic = ({ renderMode, resolvedComposition, imageFormat, setStillFormat, frame, onFrameChanged, onFrameSetDirectly, container, setContainerFormat, setCodec, encodableVideoCodecs, effectiveVideoCodec, startFrame, setStartFrame, endFrame, setEndFrame, outName, onOutNameChange, validationMessage, logLevel, setLogLevel, }) => {
    const imageFormatOptions = (0, react_1.useMemo)(() => {
        return [
            {
                label: 'PNG',
                onClick: () => setStillFormat('png'),
                key: 'png',
                selected: imageFormat === 'png',
            },
            {
                label: 'JPEG',
                onClick: () => setStillFormat('jpeg'),
                key: 'jpeg',
                selected: imageFormat === 'jpeg',
            },
            {
                label: 'WebP',
                onClick: () => setStillFormat('webp'),
                key: 'webp',
                selected: imageFormat === 'webp',
            },
        ];
    }, [imageFormat, setStillFormat]);
    const logLevelOptions = (0, react_1.useMemo)(() => {
        return ['trace', 'verbose', 'info', 'warn', 'error'].map((level) => {
            return {
                label: (0, human_readable_loglevel_1.humanReadableLogLevel)(level),
                onClick: () => setLogLevel(level),
                leftItem: logLevel === level ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: level,
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: level,
            };
        });
    }, [logLevel, setLogLevel]);
    const containerOptions = (0, react_1.useMemo)(() => {
        return [
            {
                label: 'MP4',
                onClick: () => setContainerFormat('mp4'),
                leftItem: container === 'mp4' ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: 'mp4',
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: 'mp4',
            },
            {
                label: 'WebM',
                onClick: () => setContainerFormat('webm'),
                leftItem: container === 'webm' ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: 'webm',
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: 'webm',
            },
        ];
    }, [container, setContainerFormat]);
    const codecLabels = (0, react_1.useMemo)(() => ({
        h264: 'H.264',
        h265: 'H.265',
        vp8: 'VP8',
        vp9: 'VP9',
        av1: 'AV1',
    }), []);
    const codecOptions = (0, react_1.useMemo)(() => {
        return encodableVideoCodecs.map((c) => ({
            label: codecLabels[c],
            onClick: () => setCodec(c),
            leftItem: effectiveVideoCodec === c ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
            id: c,
            keyHint: null,
            quickSwitcherLabel: null,
            subMenu: null,
            type: 'item',
            value: c,
        }));
    }, [encodableVideoCodecs, effectiveVideoCodec, setCodec, codecLabels]);
    return (jsx_runtime_1.jsxs("div", { style: tabContainer, children: [renderMode === 'still' ? (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                    jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                            jsx_runtime_1.jsx("div", { style: layout_2.label, children: "Format" }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(SegmentedControl_1.SegmentedControl, { items: imageFormatOptions, needsWrapping: true }) })
                        ] }), resolvedComposition.durationInFrames > 1 ? (jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                            jsx_runtime_1.jsx("div", { style: layout_2.label, children: "Frame" }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(RemInput_1.RightAlignInput, { children: jsx_runtime_1.jsx(InputDragger_1.InputDragger, { value: frame, onTextChange: onFrameChanged, placeholder: `0-${resolvedComposition.durationInFrames - 1}`, onValueChange: onFrameSetDirectly, name: "frame", step: 1, min: 0, status: "ok", max: resolvedComposition.durationInFrames - 1, rightAlign: true }) }) })
                        ] })) : null] })) : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                    jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                            jsx_runtime_1.jsx("div", { style: layout_2.label, children: "Container" }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(ComboBox_1.Combobox, { values: containerOptions, selectedId: container, title: "Container" }) })
                        ] }), jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                            jsx_runtime_1.jsxs("div", { style: layout_2.label, children: ["Codec",
                                    jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.5 }), jsx_runtime_1.jsx(OptionExplainerBubble_1.OptionExplainerBubble, { id: "videoCodecOption" })
                                ] }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(ComboBox_1.Combobox, { values: codecOptions, selectedId: effectiveVideoCodec, title: "Codec" }) })
                        ] }), jsx_runtime_1.jsx(FrameRangeSetting_1.FrameRangeSetting, { durationInFrames: resolvedComposition.durationInFrames, startFrame: startFrame !== null && startFrame !== void 0 ? startFrame : 0, endFrame: endFrame !== null && endFrame !== void 0 ? endFrame : resolvedComposition.durationInFrames - 1, setStartFrame: setStartFrame, setEndFrame: setEndFrame })
                ] })), jsx_runtime_1.jsx(RenderModalOutputName_1.RenderModalOutputName, { existence: false, inputStyle: layout_2.input, outName: outName, onValueChange: onOutNameChange, validationMessage: validationMessage, label: window.remotion_isReadOnlyStudio ? 'Download name' : 'Output name' }), jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                    jsx_runtime_1.jsxs("div", { style: layout_2.label, children: ["Log Level ",
                            jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.5 }), jsx_runtime_1.jsx(OptionExplainerBubble_1.OptionExplainerBubble, { id: "logLevelOption" })
                        ] }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(ComboBox_1.Combobox, { values: logLevelOptions, selectedId: logLevel, title: "Log Level" }) })
                ] })
        ] }));
};
exports.WebRenderModalBasic = WebRenderModalBasic;
