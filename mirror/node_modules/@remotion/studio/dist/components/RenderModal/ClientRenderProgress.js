"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRenderProgress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const studio_shared_1 = require("@remotion/studio-shared");
const colors_1 = require("../../helpers/colors");
const layout_1 = require("../layout");
const CircularProgress_1 = require("../RenderQueue/CircularProgress");
const SuccessIcon_1 = require("../RenderQueue/SuccessIcon");
const progressItem = {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
};
const label = {
    fontSize: 14,
    width: 400,
    color: 'white',
};
const right = {
    fontSize: 14,
    color: colors_1.LIGHT_TEXT,
    textAlign: 'right',
    flex: 1,
};
const EncodingProgress = ({ encodedFrames, totalFrames }) => {
    const done = encodedFrames === totalFrames;
    const progress = totalFrames > 0 ? encodedFrames / totalFrames : 0;
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [done ? jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {}) : jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: done
                    ? `Encoded ${totalFrames} frames`
                    : `Encoding ${encodedFrames} / ${totalFrames} frames` })
        ] }));
};
const DoneStatus = ({ job }) => {
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [
            jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {}), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: job.outName }), jsx_runtime_1.jsx("div", { style: right, children: (0, studio_shared_1.formatBytes)(job.metadata.sizeInBytes) })
        ] }));
};
const ClientRenderProgress = ({ job }) => {
    if (job.status === 'idle' ||
        job.status === 'failed' ||
        job.status === 'cancelled') {
        throw new Error('This component should not be rendered when the job is idle, failed, or cancelled');
    }
    if (job.status === 'done') {
        return (jsx_runtime_1.jsxs("div", { children: [
                jsx_runtime_1.jsx(layout_1.Spacing, { y: 0.5 }), jsx_runtime_1.jsx(DoneStatus, { job: job }), jsx_runtime_1.jsx(layout_1.Spacing, { y: 1 })
            ] }));
    }
    if (job.status === 'saving') {
        return (jsx_runtime_1.jsxs("div", { children: [
                jsx_runtime_1.jsx(layout_1.Spacing, { y: 0.5 }), jsx_runtime_1.jsx("div", { style: label, children: "Saving to out/..." }), jsx_runtime_1.jsx(layout_1.Spacing, { y: 1 })
            ] }));
    }
    const { encodedFrames, totalFrames } = job.progress;
    return (jsx_runtime_1.jsxs("div", { children: [
            jsx_runtime_1.jsx(layout_1.Spacing, { y: 0.5 }), job.type === 'client-video' && (jsx_runtime_1.jsx(EncodingProgress, { encodedFrames: encodedFrames, totalFrames: totalFrames })), jsx_runtime_1.jsx(layout_1.Spacing, { y: 1 })
        ] }));
};
exports.ClientRenderProgress = ClientRenderProgress;
