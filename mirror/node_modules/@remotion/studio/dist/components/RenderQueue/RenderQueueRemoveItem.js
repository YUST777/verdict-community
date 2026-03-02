"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderQueueRemoveItem = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const save_render_output_1 = require("../../api/save-render-output");
const InlineAction_1 = require("../InlineAction");
const NotificationCenter_1 = require("../Notifications/NotificationCenter");
const actions_1 = require("./actions");
const context_1 = require("./context");
const RenderQueueRemoveItem = ({ job }) => {
    const isClientJob = (0, context_1.isClientRenderJob)(job);
    const { removeClientJob } = (0, react_1.useContext)(context_1.RenderQueueContext);
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const { setCanvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionSetters);
    const onClick = (0, react_1.useCallback)((e) => {
        e.stopPropagation();
        if (isClientJob) {
            if (canvasContent &&
                canvasContent.type === 'output' &&
                job.status === 'done' &&
                canvasContent.path === `/${job.outName}`) {
                setCanvasContent(null);
            }
            removeClientJob(job.id);
            (0, save_render_output_1.unregisterClientRender)(job.id).catch(() => { });
            (0, NotificationCenter_1.showNotification)('Removed job', 2000);
            return;
        }
        (0, actions_1.removeRenderJob)(job)
            .then(() => {
            (0, NotificationCenter_1.showNotification)('Removed job', 2000);
        })
            .catch((err) => {
            (0, NotificationCenter_1.showNotification)(`Could not remove item: ${err.message}`, 2000);
        });
    }, [job, isClientJob, removeClientJob, canvasContent, setCanvasContent]);
    const icon = (0, react_1.useMemo)(() => {
        return {
            height: 16,
            color: 'currentColor',
        };
    }, []);
    const renderAction = (0, react_1.useCallback)((color) => {
        return (jsx_runtime_1.jsx("svg", { style: icon, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 320 512", children: jsx_runtime_1.jsx("path", { fill: color, d: "M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" }) }));
    }, [icon]);
    return jsx_runtime_1.jsx(InlineAction_1.InlineAction, { renderAction: renderAction, onClick: onClick });
};
exports.RenderQueueRemoveItem = RenderQueueRemoveItem;
