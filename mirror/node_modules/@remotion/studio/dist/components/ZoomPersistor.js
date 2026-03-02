"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoomPersistor = exports.getZoomFromLocalStorage = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
const timeline_zoom_1 = require("../state/timeline-zoom");
const load_canvas_content_from_url_1 = require("./load-canvas-content-from-url");
const makeKey = () => {
    return `remotion.zoom-map`;
};
const persistCurrentZoom = (zoom) => {
    localStorage.setItem(makeKey(), JSON.stringify(zoom));
};
const getZoomFromLocalStorage = () => {
    const zoom = localStorage.getItem(makeKey());
    return zoom ? JSON.parse(zoom) : {};
};
exports.getZoomFromLocalStorage = getZoomFromLocalStorage;
const ZoomPersistor = () => {
    const [playing] = remotion_1.Internals.Timeline.usePlayingState();
    const { zoom } = (0, react_1.useContext)(timeline_zoom_1.TimelineZoomCtx);
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const urlState = (0, load_canvas_content_from_url_1.deriveCanvasContentFromUrl)();
    const isActive = urlState &&
        urlState.type === 'composition' &&
        canvasContent &&
        canvasContent.type === 'composition' &&
        urlState.compositionId === canvasContent.compositionId;
    (0, react_1.useEffect)(() => {
        if (!isActive) {
            return;
        }
        persistCurrentZoom(zoom);
    }, [zoom, isActive, playing, urlState]);
    return null;
};
exports.ZoomPersistor = ZoomPersistor;
