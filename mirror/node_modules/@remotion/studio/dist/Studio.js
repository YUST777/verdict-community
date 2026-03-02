"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Studio = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const remotion_1 = require("remotion");
const Editor_1 = require("./components/Editor");
const EditorContexts_1 = require("./components/EditorContexts");
const ServerDisconnected_1 = require("./components/Notifications/ServerDisconnected");
const use_static_files_1 = require("./components/use-static-files");
const fast_refresh_context_1 = require("./fast-refresh-context");
const FastRefreshProvider_1 = require("./FastRefreshProvider");
const inject_css_1 = require("./helpers/inject-css");
const ResolveCompositionConfigInStudio_1 = require("./ResolveCompositionConfigInStudio");
const getServerDisconnectedDomElement = () => {
    return document.getElementById('server-disconnected-overlay');
};
const StudioInner = ({ rootComponent, readOnly }) => {
    var _a;
    const { fastRefreshes, manualRefreshes } = (0, react_1.useContext)(fast_refresh_context_1.FastRefreshContext);
    return (jsx_runtime_1.jsx(remotion_1.Internals.CompositionManagerProvider, { onlyRenderComposition: null, currentCompositionMetadata: null, initialCompositions: [], initialCanvasContent: null, children: jsx_runtime_1.jsx(remotion_1.Internals.RemotionRootContexts, { frameState: null, audioEnabled: window.remotion_audioEnabled, videoEnabled: window.remotion_videoEnabled, logLevel: window.remotion_logLevel, numberOfAudioTags: window.remotion_numberOfAudioTags, audioLatencyHint: (_a = window.remotion_audioLatencyHint) !== null && _a !== void 0 ? _a : 'interactive', nonceContextSeed: fastRefreshes + manualRefreshes, children: jsx_runtime_1.jsx(use_static_files_1.StaticFilesProvider, { children: jsx_runtime_1.jsx(ResolveCompositionConfigInStudio_1.ResolveCompositionConfigInStudio, { children: jsx_runtime_1.jsxs(EditorContexts_1.EditorContexts, { readOnlyStudio: readOnly, children: [
                            jsx_runtime_1.jsx(Editor_1.Editor, { readOnlyStudio: readOnly, Root: rootComponent }), readOnly
                                ? null
                                : (0, react_dom_1.createPortal)(jsx_runtime_1.jsx(ServerDisconnected_1.ServerDisconnected, {}), getServerDisconnectedDomElement())] }) }) }) }) }));
};
const Studio = ({ rootComponent, readOnly }) => {
    (0, react_1.useLayoutEffect)(() => {
        (0, inject_css_1.injectCSS)();
    }, []);
    return (jsx_runtime_1.jsx(FastRefreshProvider_1.FastRefreshProvider, { children: jsx_runtime_1.jsx(StudioInner, { rootComponent: rootComponent, readOnly: readOnly }) }));
};
exports.Studio = Studio;
