"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorContent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const is_current_selected_still_1 = require("../helpers/is-current-selected-still");
const InitialCompositionLoader_1 = require("./InitialCompositionLoader");
const MenuToolbar_1 = require("./MenuToolbar");
const SplitterContainer_1 = require("./Splitter/SplitterContainer");
const SplitterElement_1 = require("./Splitter/SplitterElement");
const SplitterHandle_1 = require("./Splitter/SplitterHandle");
const Timeline_1 = require("./Timeline/Timeline");
const noop = () => undefined;
const container = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 0,
};
const EditorContent = ({ readOnlyStudio, children }) => {
    const isStill = (0, is_current_selected_still_1.useIsStill)();
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    // Preventing multiple renders so the update check doesn't get rendered twice and needs to be aborted
    const onlyTopPanel = canvasContent === null || isStill || canvasContent.type !== 'composition';
    return (jsx_runtime_1.jsxs("div", { style: container, children: [
            jsx_runtime_1.jsx(InitialCompositionLoader_1.InitialCompositionLoader, {}), jsx_runtime_1.jsx(MenuToolbar_1.MenuToolbar, { readOnlyStudio: readOnlyStudio }), jsx_runtime_1.jsxs(SplitterContainer_1.SplitterContainer, { orientation: "horizontal", id: "top-to-bottom", maxFlex: 0.9, minFlex: 0.2, defaultFlex: 0.75, children: [
                    jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "flexer", children: children }), onlyTopPanel ? null : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                            jsx_runtime_1.jsx(SplitterHandle_1.SplitterHandle, { allowToCollapse: "none", onCollapse: noop }), jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "anti-flexer", children: jsx_runtime_1.jsx(Timeline_1.Timeline, {}) })
                        ] }))] })
        ] }));
};
exports.EditorContent = EditorContent;
