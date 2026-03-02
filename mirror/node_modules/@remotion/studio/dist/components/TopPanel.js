"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopPanel = exports.useResponsiveSidebarStatus = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const mobile_layout_1 = require("../helpers/mobile-layout");
const use_breakpoint_1 = require("../helpers/use-breakpoint");
const editor_rulers_1 = require("../state/editor-rulers");
const sidebar_1 = require("../state/sidebar");
const CanvasIfSizeIsAvailable_1 = require("./CanvasIfSizeIsAvailable");
const CurrentCompositionSideEffects_1 = require("./CurrentCompositionSideEffects");
const use_is_ruler_visible_1 = require("./EditorRuler/use-is-ruler-visible");
const ExplorerPanel_1 = require("./ExplorerPanel");
const MobilePanel_1 = __importDefault(require("./MobilePanel"));
const OptionsPanel_1 = require("./OptionsPanel");
const PreviewToolbar_1 = require("./PreviewToolbar");
const SplitterContainer_1 = require("./Splitter/SplitterContainer");
const SplitterElement_1 = require("./Splitter/SplitterElement");
const SplitterHandle_1 = require("./Splitter/SplitterHandle");
const container = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
};
const row = {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 0,
};
const useResponsiveSidebarStatus = () => {
    const { sidebarCollapsedStateLeft } = (0, react_1.useContext)(sidebar_1.SidebarContext);
    const responsiveLeftStatus = (0, use_breakpoint_1.useBreakpoint)(1200) ? 'collapsed' : 'expanded';
    const actualStateLeft = (0, react_1.useMemo)(() => {
        if (sidebarCollapsedStateLeft === 'collapsed') {
            return 'collapsed';
        }
        if (sidebarCollapsedStateLeft === 'expanded') {
            return 'expanded';
        }
        return responsiveLeftStatus;
    }, [sidebarCollapsedStateLeft, responsiveLeftStatus]);
    return actualStateLeft;
};
exports.useResponsiveSidebarStatus = useResponsiveSidebarStatus;
const TopPanel = ({ readOnlyStudio, onMounted, drawRef, bufferStateDelayInMilliseconds }) => {
    const { setSidebarCollapsedState, sidebarCollapsedStateRight } = (0, react_1.useContext)(sidebar_1.SidebarContext);
    const rulersAreVisible = (0, use_is_ruler_visible_1.useIsRulerVisible)();
    const actualStateLeft = (0, exports.useResponsiveSidebarStatus)();
    const actualStateRight = (0, react_1.useMemo)(() => {
        if (sidebarCollapsedStateRight === 'collapsed') {
            return 'collapsed';
        }
        return 'expanded';
    }, [sidebarCollapsedStateRight]);
    (0, react_1.useEffect)(() => {
        onMounted();
    }, [onMounted]);
    const canvasContainerStyle = (0, react_1.useMemo)(() => ({
        flex: 1,
        display: 'flex',
        paddingTop: rulersAreVisible ? editor_rulers_1.RULER_WIDTH : 0,
        paddingLeft: rulersAreVisible ? editor_rulers_1.RULER_WIDTH : 0,
    }), [rulersAreVisible]);
    const onCollapseLeft = (0, react_1.useCallback)(() => {
        setSidebarCollapsedState({ left: 'collapsed', right: null });
    }, [setSidebarCollapsedState]);
    const onCollapseRight = (0, react_1.useCallback)(() => {
        setSidebarCollapsedState({ left: null, right: 'collapsed' });
    }, [setSidebarCollapsedState]);
    const isMobileLayout = (0, mobile_layout_1.useMobileLayout)();
    return (jsx_runtime_1.jsxs("div", { style: container, children: [
            jsx_runtime_1.jsx("div", { style: row, children: jsx_runtime_1.jsxs(SplitterContainer_1.SplitterContainer, { minFlex: 0.15, maxFlex: 0.4, defaultFlex: 0.2, id: "sidebar-to-preview", orientation: "vertical", children: [actualStateLeft === 'expanded' ? (isMobileLayout ? (jsx_runtime_1.jsx(MobilePanel_1.default, { onClose: onCollapseLeft, children: jsx_runtime_1.jsx(ExplorerPanel_1.ExplorerPanel, { readOnlyStudio: readOnlyStudio }) })) : (jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "flexer", children: jsx_runtime_1.jsx(ExplorerPanel_1.ExplorerPanel, { readOnlyStudio: readOnlyStudio }) }))) : null, actualStateLeft === 'expanded' ? (jsx_runtime_1.jsx(SplitterHandle_1.SplitterHandle, { allowToCollapse: "left", onCollapse: onCollapseLeft })) : null, jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "anti-flexer", children: jsx_runtime_1.jsxs(SplitterContainer_1.SplitterContainer, { minFlex: 0.5, maxFlex: 0.8, defaultFlex: 0.7, id: "canvas-to-right-sidebar", orientation: "vertical", children: [
                                    jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "flexer", children: jsx_runtime_1.jsx("div", { ref: drawRef, style: canvasContainerStyle, children: jsx_runtime_1.jsx(CanvasIfSizeIsAvailable_1.CanvasIfSizeIsAvailable, {}) }) }), actualStateRight === 'expanded' ? (jsx_runtime_1.jsx(SplitterHandle_1.SplitterHandle, { allowToCollapse: "right", onCollapse: onCollapseRight })) : null, actualStateRight === 'expanded' ? (isMobileLayout ? (jsx_runtime_1.jsx(MobilePanel_1.default, { onClose: onCollapseRight, children: jsx_runtime_1.jsx(OptionsPanel_1.OptionsPanel, { readOnlyStudio: readOnlyStudio }) })) : (jsx_runtime_1.jsx(SplitterElement_1.SplitterElement, { sticky: null, type: "anti-flexer", children: jsx_runtime_1.jsx(OptionsPanel_1.OptionsPanel, { readOnlyStudio: readOnlyStudio }) }))) : null] }) })
                    ] }) }), jsx_runtime_1.jsx(PreviewToolbar_1.PreviewToolbar, { bufferStateDelayInMilliseconds: bufferStateDelayInMilliseconds, readOnlyStudio: readOnlyStudio }), jsx_runtime_1.jsx(CurrentCompositionSideEffects_1.CurrentCompositionKeybindings, { readOnlyStudio: readOnlyStudio }), jsx_runtime_1.jsx(CurrentCompositionSideEffects_1.TitleUpdater, {})
        ] }));
};
exports.TopPanel = TopPanel;
