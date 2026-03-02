"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiRenderStatus = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../../helpers/colors");
const layout_1 = require("../layout");
const actions_1 = require("../RenderQueue/actions");
const CircularProgress_1 = require("../RenderQueue/CircularProgress");
const RenderQueueOpenInFolder_1 = require("../RenderQueue/RenderQueueOpenInFolder");
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
const BundlingProgress = ({ progress, doneIn }) => {
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [progress === 1 ? (jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {})) : (jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress })), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: progress === 1 ? 'Bundled' : `Bundling ${progress * 100}%` }), doneIn ? jsx_runtime_1.jsxs("div", { style: right, children: [doneIn, "ms"] }) : null] }));
};
const BrowserSetupProgress = ({ progress, doneIn, startedBundling, alreadyAvailable }) => {
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [progress === 1 || alreadyAvailable ? (jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {})) : (jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress })), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: alreadyAvailable && startedBundling
                    ? 'Headless browser already available'
                    : progress === 1
                        ? 'Downloaded Headless Shell'
                        : `Downloading Headless Shell ${Math.round(progress * 100)}%` }), doneIn ? jsx_runtime_1.jsxs("div", { style: right, children: [doneIn, "ms"] }) : null] }));
};
const RenderingProgress = ({ progress }) => {
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [progress.frames === progress.totalFrames ? (jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {})) : (jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress.frames / progress.totalFrames })), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: progress.doneIn
                    ? `Rendered ${progress.totalFrames} frames`
                    : `Rendering ${progress.frames} / ${progress.totalFrames} frames` }), progress.doneIn ? jsx_runtime_1.jsxs("div", { style: right, children: [progress.doneIn, "ms"] }) : null] }));
};
const StitchingProgress = ({ progress }) => {
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [progress.frames === progress.totalFrames ? (jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {})) : (jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress.frames / progress.totalFrames })), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: label, children: progress.doneIn
                    ? `Encoded ${progress.totalFrames} frames`
                    : `Encoding ${progress.frames} / ${progress.totalFrames} frames` }), progress.doneIn ? jsx_runtime_1.jsxs("div", { style: right, children: [progress.doneIn, "ms"] }) : null] }));
};
const DownloadsProgress = ({ downloads }) => {
    const allHaveProgress = downloads.every((a) => a.totalBytes);
    const totalBytes = allHaveProgress
        ? downloads.reduce((a, b) => a + b.totalBytes, 0)
        : null;
    const downloaded = allHaveProgress
        ? downloads.reduce((a, b) => a + b.downloaded, 0)
        : null;
    const progress = allHaveProgress
        ? downloaded / totalBytes
        : 0.1;
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [progress === 1 ? (jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {})) : (jsx_runtime_1.jsx(CircularProgress_1.CircularProgress, { progress: progress })), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsxs("div", { style: label, children: ["Downloading ", downloads.length, " file", downloads.length === 1 ? '' : 's'] })
        ] }));
};
const OpenFile = ({ job }) => {
    const labelStyle = (0, react_1.useMemo)(() => {
        return {
            ...label,
            textAlign: 'left',
            appearance: 'none',
            border: 0,
            paddingLeft: 0,
            cursor: job.deletedOutputLocation ? 'inherit' : 'pointer',
            textDecoration: job.deletedOutputLocation ? 'line-through' : 'none',
        };
    }, [job.deletedOutputLocation]);
    const onClick = (0, react_1.useCallback)(() => {
        (0, actions_1.openInFileExplorer)({ directory: job.outName });
    }, [job.outName]);
    return (jsx_runtime_1.jsxs("div", { style: progressItem, children: [
            jsx_runtime_1.jsx(SuccessIcon_1.SuccessIcon, {}), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("button", { style: labelStyle, type: "button", onClick: onClick, children: job.outName }), jsx_runtime_1.jsx("div", { style: right, children: jsx_runtime_1.jsx(RenderQueueOpenInFolder_1.RenderQueueOpenInFinderItem, { job: job }) })
        ] }));
};
const GuiRenderStatus = ({ job }) => {
    if (job.status === 'idle' || job.status === 'failed') {
        throw new Error('This component should not be rendered when the job is idle');
    }
    return (jsx_runtime_1.jsxs("div", { children: [
            jsx_runtime_1.jsx(layout_1.Spacing, { y: 0.5 }), jsx_runtime_1.jsx(BrowserSetupProgress, { ...job.progress.browser, startedBundling: Boolean(job.progress.bundling) }), job.progress.bundling && (jsx_runtime_1.jsx(BundlingProgress, { progress: job.progress.bundling.progress, doneIn: job.progress.bundling.doneIn })), job.progress.rendering ? (jsx_runtime_1.jsx(RenderingProgress, { progress: job.progress.rendering })) : null, job.progress.stitching ? (jsx_runtime_1.jsx(StitchingProgress, { progress: job.progress.stitching })) : null, job.progress.downloads.length > 0 ? (jsx_runtime_1.jsx(DownloadsProgress, { downloads: job.progress.downloads })) : null, job.status === 'done' ? jsx_runtime_1.jsx(OpenFile, { job: job }) : null, jsx_runtime_1.jsx(layout_1.Spacing, { y: 1 })
        ] }));
};
exports.GuiRenderStatus = GuiRenderStatus;
