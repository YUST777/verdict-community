"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueItem = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../../helpers/colors");
const url_state_1 = require("../../helpers/url-state");
const layout_1 = require("../layout");
const client_side_render_types_1 = require("./client-side-render-types");
const context_1 = require("./context");
const RenderQueueCancelledMessage_1 = require("./RenderQueueCancelledMessage");
const RenderQueueCopyToClipboard_1 = require("./RenderQueueCopyToClipboard");
const RenderQueueDownloadItem_1 = require("./RenderQueueDownloadItem");
const RenderQueueError_1 = require("./RenderQueueError");
const RenderQueueItemCancelButton_1 = require("./RenderQueueItemCancelButton");
const RenderQueueItemStatus_1 = require("./RenderQueueItemStatus");
const RenderQueueOpenInFolder_1 = require("./RenderQueueOpenInFolder");
const RenderQueueOutputName_1 = require("./RenderQueueOutputName");
const RenderQueueProgressMessage_1 = require("./RenderQueueProgressMessage");
const RenderQueueRemoveItem_1 = require("./RenderQueueRemoveItem");
const RenderQueueRepeat_1 = require("./RenderQueueRepeat");
const RenderQueueSavingMessage_1 = require("./RenderQueueSavingMessage");
const container = {
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: 10,
    paddingRight: 4,
};
const title = {
    fontSize: 13,
    lineHeight: 1,
};
const right = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};
const subtitle = {
    maxWidth: '100%',
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
};
const SELECTED_CLASSNAME = '__remotion_selected_classname';
const RenderQueueItem = ({ job, selected }) => {
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const { setCanvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionSetters);
    const isClientJob = (0, context_1.isClientRenderJob)(job);
    const onPointerEnter = (0, react_1.useCallback)(() => {
        setHovered(true);
    }, []);
    const onPointerLeave = (0, react_1.useCallback)(() => {
        setHovered(false);
    }, []);
    const isHoverable = job.status === 'done' && (isClientJob || job.type !== 'sequence');
    const containerStyle = (0, react_1.useMemo)(() => {
        return {
            ...container,
            backgroundColor: (0, colors_1.getBackgroundFromHoverState)({
                hovered: isHoverable && hovered,
                selected,
            }),
            userSelect: 'none',
            WebkitUserSelect: 'none',
        };
    }, [hovered, isHoverable, selected]);
    const scrollCurrentIntoView = (0, react_1.useCallback)(() => {
        var _a;
        (_a = document
            .querySelector(`.${SELECTED_CLASSNAME}`)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    }, []);
    const clientBlobInfo = (0, react_1.useMemo)(() => {
        if (!isClientJob || job.status !== 'done' || !job.getBlob) {
            return null;
        }
        return {
            getBlob: job.getBlob,
            width: job.metadata.width,
            height: job.metadata.height,
            sizeInBytes: job.metadata.sizeInBytes,
        };
    }, [isClientJob, job]);
    const onClick = (0, react_1.useCallback)(() => {
        if (job.status !== 'done') {
            return;
        }
        // Cannot show folders
        if (!isClientJob && job.type === 'sequence') {
            return;
        }
        if (clientBlobInfo) {
            setCanvasContent((c) => {
                const isAlreadySelected = c && c.type === 'output-blob' && c.displayName === job.outName;
                if (isAlreadySelected && !selected) {
                    scrollCurrentIntoView();
                    return c;
                }
                return {
                    type: 'output-blob',
                    displayName: job.outName,
                    getBlob: clientBlobInfo.getBlob,
                    width: clientBlobInfo.width,
                    height: clientBlobInfo.height,
                    sizeInBytes: clientBlobInfo.sizeInBytes,
                };
            });
            return;
        }
        setCanvasContent((c) => {
            const isAlreadySelected = c && c.type === 'output' && c.path === `/${job.outName}`;
            if (isAlreadySelected && !selected) {
                scrollCurrentIntoView();
                return c;
            }
            return { type: 'output', path: `/${job.outName}` };
        });
        (0, url_state_1.pushUrl)(`/outputs/${job.outName}`);
    }, [
        job,
        isClientJob,
        clientBlobInfo,
        scrollCurrentIntoView,
        selected,
        setCanvasContent,
    ]);
    (0, react_1.useEffect)(() => {
        if (selected) {
            scrollCurrentIntoView();
        }
    }, [scrollCurrentIntoView, selected]);
    const canCopyToClipboard = job.status === 'done' &&
        !isClientJob &&
        (0, RenderQueueCopyToClipboard_1.supportsCopyingToClipboard)(job);
    const canRepeat = (job.status === 'done' ||
        job.status === 'failed' ||
        job.status === 'cancelled') &&
        !((0, context_1.isClientRenderJob)(job) && (0, client_side_render_types_1.isRestoredClientJob)(job));
    return (jsx_runtime_1.jsxs(layout_1.Row, { onPointerEnter: onPointerEnter, onPointerLeave: onPointerLeave, style: containerStyle, align: "center", onClick: onClick, className: selected ? SELECTED_CLASSNAME : undefined, children: [
            jsx_runtime_1.jsx(RenderQueueItemStatus_1.RenderQueueItemStatus, { job: job }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsxs("div", { style: right, children: [
                    jsx_runtime_1.jsx("div", { style: title, children: job.compositionId }), jsx_runtime_1.jsx("div", { style: subtitle, children: job.status === 'done' ? (jsx_runtime_1.jsx(RenderQueueOutputName_1.RenderQueueOutputName, { job: job })) : job.status === 'failed' ? (jsx_runtime_1.jsx(RenderQueueError_1.RenderQueueError, { job: job })) : job.status === 'running' ? (jsx_runtime_1.jsx(RenderQueueProgressMessage_1.RenderQueueProgressMessage, { job: job })) : job.status === 'saving' ? (jsx_runtime_1.jsx(RenderQueueSavingMessage_1.RenderQueueSavingMessage, {})) : job.status === 'cancelled' ? (jsx_runtime_1.jsx(RenderQueueCancelledMessage_1.RenderQueueCancelledMessage, {})) : null })
                ] }), jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), canCopyToClipboard ? (jsx_runtime_1.jsx(RenderQueueCopyToClipboard_1.RenderQueueCopyToClipboard, { job: job })) : null, canRepeat ? jsx_runtime_1.jsx(RenderQueueRepeat_1.RenderQueueRepeatItem, { job: job }) : null, job.status === 'running' ? (jsx_runtime_1.jsx(RenderQueueItemCancelButton_1.RenderQueueCancelButton, { job: job })) : (jsx_runtime_1.jsx(RenderQueueRemoveItem_1.RenderQueueRemoveItem, { job: job })), job.status === 'done' ? (clientBlobInfo ? (jsx_runtime_1.jsx(RenderQueueDownloadItem_1.RenderQueueDownloadItem, { job: job })) : (jsx_runtime_1.jsx(RenderQueueOpenInFolder_1.RenderQueueOpenInFinderItem, { job: job }))) : null] }));
};
exports.RenderQueueItem = RenderQueueItem;
