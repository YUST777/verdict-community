"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsPanel = exports.optionsSidebarTabs = exports.persistSelectedOptionsSidebarPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../helpers/colors");
const mobile_layout_1 = require("../helpers/mobile-layout");
const show_browser_rendering_1 = require("../helpers/show-browser-rendering");
const VisualControls_1 = require("../visual-controls/VisualControls");
const GlobalPropsEditorUpdateButton_1 = require("./GlobalPropsEditorUpdateButton");
const DataEditor_1 = require("./RenderModal/DataEditor");
const deep_equal_1 = require("./RenderModal/SchemaEditor/deep-equal");
const RenderQueue_1 = require("./RenderQueue");
const RendersTab_1 = require("./RendersTab");
const Tabs_1 = require("./Tabs");
const VisualControlsContent_1 = require("./VisualControls/VisualControlsContent");
const localStorageKey = 'remotion.sidebarPanel';
const getSelectedPanel = (renderingAvailable) => {
    if (!renderingAvailable) {
        return 'input-props';
    }
    const panel = localStorage.getItem(localStorageKey);
    if (panel === 'renders') {
        return 'renders';
    }
    if (panel === 'visual-controls') {
        return 'visual-controls';
    }
    return 'input-props';
};
const tabsContainer = {
    backgroundColor: colors_1.BACKGROUND,
};
const persistSelectedOptionsSidebarPanel = (panel) => {
    localStorage.setItem(localStorageKey, panel);
};
exports.persistSelectedOptionsSidebarPanel = persistSelectedOptionsSidebarPanel;
exports.optionsSidebarTabs = (0, react_1.createRef)();
const OptionsPanel = ({ readOnlyStudio }) => {
    const { props, updateProps, resetUnsaved } = (0, react_1.useContext)(remotion_1.Internals.EditorPropsContext);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const renderingAvailable = !readOnlyStudio || show_browser_rendering_1.SHOW_BROWSER_RENDERING;
    const isMobileLayout = (0, mobile_layout_1.useMobileLayout)();
    const visualControlsTabActivated = (0, react_1.useContext)(VisualControls_1.VisualControlsTabActivatedContext);
    const container = (0, react_1.useMemo)(() => ({
        height: '100%',
        width: '100%',
        display: 'flex',
        position: isMobileLayout ? 'relative' : 'absolute',
        flexDirection: 'column',
        flex: 1,
    }), [isMobileLayout]);
    const [panel, setPanel] = (0, react_1.useState)(() => getSelectedPanel(renderingAvailable));
    const onPropsSelected = (0, react_1.useCallback)(() => {
        setPanel('input-props');
        (0, exports.persistSelectedOptionsSidebarPanel)('input-props');
    }, []);
    const onRendersSelected = (0, react_1.useCallback)(() => {
        setPanel('renders');
        (0, exports.persistSelectedOptionsSidebarPanel)('renders');
    }, []);
    const onVisualControlsSelected = (0, react_1.useCallback)(() => {
        setPanel('visual-controls');
        (0, exports.persistSelectedOptionsSidebarPanel)('visual-controls');
    }, []);
    (0, react_1.useImperativeHandle)(exports.optionsSidebarTabs, () => {
        return {
            selectRendersPanel: () => {
                setPanel('renders');
                (0, exports.persistSelectedOptionsSidebarPanel)('renders');
            },
        };
    }, []);
    const { compositions, canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const composition = (0, react_1.useMemo)(() => {
        if (canvasContent === null || canvasContent.type !== 'composition') {
            return null;
        }
        for (const comp of compositions) {
            if (comp.id === canvasContent.compositionId) {
                return comp;
            }
        }
        return null;
    }, [canvasContent, compositions]);
    const setDefaultProps = (0, react_1.useCallback)((newProps) => {
        if (composition === null) {
            return;
        }
        window.remotion_ignoreFastRefreshUpdate = null;
        updateProps({
            id: composition.id,
            defaultProps: composition.defaultProps,
            newProps,
        });
    }, [composition, updateProps]);
    const currentDefaultProps = (0, react_1.useMemo)(() => {
        var _a, _b;
        if (composition === null) {
            return {};
        }
        return (_b = (_a = props[composition.id]) !== null && _a !== void 0 ? _a : composition.defaultProps) !== null && _b !== void 0 ? _b : {};
    }, [composition, props]);
    const unsavedChangesExist = (0, react_1.useMemo)(() => {
        if (composition === null || composition.defaultProps === undefined) {
            return false;
        }
        return !(0, deep_equal_1.deepEqual)(composition.defaultProps, currentDefaultProps);
    }, [currentDefaultProps, composition]);
    const reset = (0, react_1.useCallback)((e) => {
        if (e.detail.resetUnsaved) {
            resetUnsaved(e.detail.resetUnsaved);
        }
    }, [resetUnsaved]);
    (0, react_1.useEffect)(() => {
        window.addEventListener(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, reset);
        return () => {
            window.removeEventListener(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, reset);
        };
    }, [reset]);
    return (jsx_runtime_1.jsxs("div", { style: container, className: "css-reset", children: [
            jsx_runtime_1.jsx("div", { style: tabsContainer, children: jsx_runtime_1.jsxs(Tabs_1.Tabs, { children: [visualControlsTabActivated ? (jsx_runtime_1.jsx(Tabs_1.Tab, { selected: panel === 'visual-controls', onClick: onVisualControlsSelected, children: "Controls" })) : null, composition ? (jsx_runtime_1.jsxs(Tabs_1.Tab, { selected: panel === 'input-props', onClick: onPropsSelected, style: { justifyContent: 'space-between' }, children: ["Props", unsavedChangesExist ? (jsx_runtime_1.jsx(GlobalPropsEditorUpdateButton_1.GlobalPropsEditorUpdateButton, { compositionId: composition.id, currentDefaultProps: currentDefaultProps })) : null] })) : null, renderingAvailable ? (jsx_runtime_1.jsx(RendersTab_1.RendersTab, { onClick: onRendersSelected, selected: panel === 'renders' })) : null] }) }), panel === `input-props` && composition ? (jsx_runtime_1.jsx(DataEditor_1.DataEditor, { unresolvedComposition: composition, defaultProps: currentDefaultProps, setDefaultProps: setDefaultProps, mayShowSaveButton: true, propsEditType: "default-props", saving: saving, setSaving: setSaving, readOnlyStudio: readOnlyStudio }, composition.id)) : panel === 'visual-controls' && visualControlsTabActivated ? (jsx_runtime_1.jsx(VisualControlsContent_1.VisualControlsContent, {})) : !renderingAvailable ? null : (jsx_runtime_1.jsx(RenderQueue_1.RenderQueue, {}))] }));
};
exports.OptionsPanel = OptionsPanel;
