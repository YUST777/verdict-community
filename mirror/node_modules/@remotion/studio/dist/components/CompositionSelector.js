"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionSelector = exports.getKeysToExpand = exports.useCompositionNavigation = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const colors_1 = require("../helpers/colors");
const create_folder_tree_1 = require("../helpers/create-folder-tree");
const persist_open_folders_1 = require("../helpers/persist-open-folders");
const z_index_1 = require("../state/z-index");
const CompositionSelectorItem_1 = require("./CompositionSelectorItem");
const CurrentComposition_1 = require("./CurrentComposition");
const InitialCompositionLoader_1 = require("./InitialCompositionLoader");
const useCompositionNavigation = () => {
    const { compositions, canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const selectComposition = (0, InitialCompositionLoader_1.useSelectComposition)();
    const navigateToNextComposition = (0, react_1.useCallback)(() => {
        if (!canvasContent ||
            canvasContent.type !== 'composition' ||
            compositions.length <= 1) {
            return;
        }
        const currentIndex = compositions.findIndex((c) => c.id === canvasContent.compositionId);
        if (currentIndex === -1) {
            return;
        }
        const nextIndex = (currentIndex + 1) % compositions.length;
        const nextComposition = compositions[nextIndex];
        selectComposition(nextComposition, true);
    }, [canvasContent, compositions, selectComposition]);
    const navigateToPreviousComposition = (0, react_1.useCallback)(() => {
        if (!canvasContent ||
            canvasContent.type !== 'composition' ||
            compositions.length <= 1) {
            return;
        }
        const currentIndex = compositions.findIndex((c) => c.id === canvasContent.compositionId);
        if (currentIndex === -1) {
            return;
        }
        const previousIndex = (currentIndex - 1 + compositions.length) % compositions.length;
        const previousComposition = compositions[previousIndex];
        selectComposition(previousComposition, true);
    }, [canvasContent, compositions, selectComposition]);
    return (0, react_1.useMemo)(() => ({
        navigateToNextComposition,
        navigateToPreviousComposition,
    }), [navigateToNextComposition, navigateToPreviousComposition]);
};
exports.useCompositionNavigation = useCompositionNavigation;
const container = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors_1.BACKGROUND,
};
const getKeysToExpand = (initialFolderName, parentFolderName, initial = []) => {
    initial.push((0, persist_open_folders_1.openFolderKey)({
        folderName: initialFolderName,
        parentName: parentFolderName,
    }));
    const { name, parent } = (0, create_folder_tree_1.splitParentIntoNameAndParent)(parentFolderName);
    if (!name) {
        return initial;
    }
    return (0, exports.getKeysToExpand)(name, parent, initial);
};
exports.getKeysToExpand = getKeysToExpand;
const CompositionSelector = () => {
    const { compositions, canvasContent, folders } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const { foldersExpanded } = (0, react_1.useContext)(persist_open_folders_1.ExpandedFoldersContext);
    const { tabIndex } = (0, z_index_1.useZIndex)();
    const selectComposition = (0, InitialCompositionLoader_1.useSelectComposition)();
    const items = (0, react_1.useMemo)(() => {
        return (0, create_folder_tree_1.createFolderTree)(compositions, folders, foldersExpanded);
    }, [compositions, folders, foldersExpanded]);
    const showCurrentComposition = canvasContent && canvasContent.type === 'composition';
    const list = (0, react_1.useMemo)(() => {
        return {
            height: showCurrentComposition
                ? `calc(100% - ${CurrentComposition_1.CURRENT_COMPOSITION_HEIGHT}px)`
                : '100%',
            overflowY: 'auto',
        };
    }, [showCurrentComposition]);
    const toggleFolder = (0, react_1.useCallback)((folderName, parentName) => {
        var _a;
        (_a = remotion_1.Internals.compositionSelectorRef.current) === null || _a === void 0 ? void 0 : _a.toggleFolder(folderName, parentName);
    }, []);
    return (jsx_runtime_1.jsxs("div", { style: container, children: [showCurrentComposition ? jsx_runtime_1.jsx(CurrentComposition_1.CurrentComposition, {}) : null, jsx_runtime_1.jsx("div", { className: "__remotion-vertical-scrollbar", style: list, children: items.map((c) => {
                    return (jsx_runtime_1.jsx(CompositionSelectorItem_1.CompositionSelectorItem, { level: 0, currentComposition: showCurrentComposition ? canvasContent.compositionId : null, selectComposition: selectComposition, toggleFolder: toggleFolder, tabIndex: tabIndex, item: c }, c.key + c.type));
                }) })
        ] }));
};
exports.CompositionSelector = CompositionSelector;
