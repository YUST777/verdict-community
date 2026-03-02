"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasOrLoading = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const ErrorLoader_1 = require("../error-overlay/remotion-overlay/ErrorLoader");
const colors_1 = require("../helpers/colors");
const timeline_zoom_1 = require("../state/timeline-zoom");
const Canvas_1 = require("./Canvas");
const FramePersistor_1 = require("./FramePersistor");
const is_menu_item_1 = require("./Menu/is-menu-item");
const RefreshCompositionOverlay_1 = require("./RefreshCompositionOverlay");
const RunningCalculateMetadata_1 = require("./RunningCalculateMetadata");
const imperative_state_1 = require("./Timeline/imperative-state");
const timeline_scroll_logic_1 = require("./Timeline/timeline-scroll-logic");
const ZoomPersistor_1 = require("./ZoomPersistor");
const container = {
    color: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    backgroundColor: colors_1.BACKGROUND,
    flexDirection: 'column',
};
const CanvasOrLoading = ({ size }) => {
    const resolved = remotion_1.Internals.useResolvedVideoConfig(null);
    const { setZoom } = (0, react_1.useContext)(timeline_zoom_1.TimelineZoomCtx);
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    (0, react_1.useEffect)(() => {
        if ((resolved === null || resolved === void 0 ? void 0 : resolved.type) !== 'success' &&
            (resolved === null || resolved === void 0 ? void 0 : resolved.type) !== 'success-and-refreshing') {
            return;
        }
        const c = resolved.result;
        setTimeout(() => {
            (0, timeline_scroll_logic_1.ensureFrameIsInViewport)({
                direction: 'center',
                frame: (0, imperative_state_1.getCurrentFrame)(),
                durationInFrames: c.durationInFrames,
            });
        });
    }, [resolved, setZoom]);
    if (!canvasContent) {
        const compname = window.location.pathname.replace('/', '');
        return (jsx_runtime_1.jsx("div", { style: container, className: "css-reset", children: jsx_runtime_1.jsxs("div", { style: RunningCalculateMetadata_1.loaderLabel, children: ["Composition with ID ", compname, " not found."] }) }));
    }
    const content = (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
            jsx_runtime_1.jsx(ZoomPersistor_1.ZoomPersistor, {}), jsx_runtime_1.jsx(Canvas_1.Canvas, { size: size, canvasContent: canvasContent }), (resolved === null || resolved === void 0 ? void 0 : resolved.type) === 'success-and-refreshing' ? (jsx_runtime_1.jsx(RefreshCompositionOverlay_1.RefreshCompositionOverlay, {})) : null] }));
    if (canvasContent.type === 'asset' ||
        canvasContent.type === 'output' ||
        canvasContent.type === 'output-blob') {
        return content;
    }
    if (!resolved) {
        return null;
    }
    if (resolved.type === 'loading') {
        return (jsx_runtime_1.jsx("div", { style: container, className: "css-reset", children: jsx_runtime_1.jsx(RunningCalculateMetadata_1.RunningCalculateMetadata, {}) }));
    }
    if (resolved.type === 'error') {
        return jsx_runtime_1.jsx(ErrorLoading, { error: resolved.error });
    }
    return (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
            jsx_runtime_1.jsx(FramePersistor_1.FramePersistor, {}),
            " ", content] }));
};
exports.CanvasOrLoading = CanvasOrLoading;
const loaderContainer = {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    position: 'absolute',
    height: '100%',
    overflowY: 'auto',
};
const ErrorLoading = ({ error }) => {
    return (jsx_runtime_1.jsx("div", { style: loaderContainer, className: is_menu_item_1.VERTICAL_SCROLLBAR_CLASSNAME, children: jsx_runtime_1.jsx(ErrorLoader_1.ErrorLoader, { canHaveDismissButton: false, keyboardShortcuts: false, error: error, onRetry: () => {
                var _a;
                return (_a = remotion_1.Internals.resolveCompositionsRef.current) === null || _a === void 0 ? void 0 : _a.reloadCurrentlySelectedComposition();
            }, calculateMetadata: true }, error.stack) }));
};
