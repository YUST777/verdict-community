"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueProgressMessage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const modals_1 = require("../../state/modals");
const z_index_1 = require("../../state/z-index");
const context_1 = require("./context");
const item_style_1 = require("./item-style");
const outputLocation = {
    ...item_style_1.renderQueueItemSubtitleStyle,
};
const RenderQueueProgressMessage = ({ job }) => {
    if (job.status !== 'running') {
        throw new Error('should not have rendered this component');
    }
    const { setSelectedModal } = (0, react_1.useContext)(modals_1.ModalsContext);
    const { tabIndex } = (0, z_index_1.useZIndex)();
    const isClientJob = (0, context_1.isClientRenderJob)(job);
    const onClick = (0, react_1.useCallback)(() => {
        setSelectedModal({
            type: 'render-progress',
            jobId: job.id,
        });
    }, [job.id, setSelectedModal]);
    const message = isClientJob
        ? job.progress.totalFrames === 0
            ? 'Getting composition'
            : `Encoding frame ${job.progress.encodedFrames}/${job.progress.totalFrames}`
        : job.progress.message;
    return (jsx_runtime_1.jsx("button", { onClick: onClick, type: "button", style: outputLocation, tabIndex: tabIndex, title: message, children: message }));
};
exports.RenderQueueProgressMessage = RenderQueueProgressMessage;
