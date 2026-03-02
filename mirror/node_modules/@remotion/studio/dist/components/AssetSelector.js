"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetSelector = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const write_static_file_1 = require("../api/write-static-file");
const client_id_1 = require("../helpers/client-id");
const colors_1 = require("../helpers/colors");
const create_folder_tree_1 = require("../helpers/create-folder-tree");
const persist_open_folders_1 = require("../helpers/persist-open-folders");
const use_asset_drag_events_1 = __importDefault(require("../helpers/use-asset-drag-events"));
const folders_1 = require("../state/folders");
const z_index_1 = require("../state/z-index");
const AssetSelectorItem_1 = require("./AssetSelectorItem");
const CurrentAsset_1 = require("./CurrentAsset");
const styles_1 = require("./Menu/styles");
const NotificationCenter_1 = require("./Notifications/NotificationCenter");
const use_static_files_1 = require("./use-static-files");
const container = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors_1.BACKGROUND,
};
// Some redundancy with packages/cli/src/editor/components/RenderModal/SchemaEditor/SchemaErrorMessages.tsx
const emptyState = {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 12px',
};
const label = {
    color: colors_1.LIGHT_TEXT,
    lineHeight: 1.5,
    fontSize: 14,
};
const baseList = {
    overflowY: 'auto',
};
const AssetSelector = ({ readOnlyStudio }) => {
    const { tabIndex } = (0, z_index_1.useZIndex)();
    const { canvasContent } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const { assetFoldersExpanded, setAssetFoldersExpanded } = (0, react_1.useContext)(folders_1.FolderContext);
    const [dropLocation, setDropLocation] = (0, react_1.useState)(null);
    const connectionStatus = (0, react_1.useContext)(client_id_1.StudioServerConnectionCtx)
        .previewServerState.type;
    const shouldAllowUpload = connectionStatus === 'connected' && !readOnlyStudio;
    const showCurrentAsset = (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'asset';
    const list = (0, react_1.useMemo)(() => {
        return {
            ...baseList,
            height: showCurrentAsset
                ? `calc(100% - ${CurrentAsset_1.CURRENT_ASSET_HEIGHT}px)`
                : '100%',
        };
    }, [showCurrentAsset]);
    const staticFiles = (0, use_static_files_1.useStaticFiles)();
    const publicFolderExists = window.remotion_publicFolderExists;
    const assetTree = (0, react_1.useMemo)(() => {
        return (0, create_folder_tree_1.buildAssetFolderStructure)(staticFiles, null, assetFoldersExpanded);
    }, [assetFoldersExpanded, staticFiles]);
    const toggleFolder = (0, react_1.useCallback)((folderName, parentName) => {
        setAssetFoldersExpanded((p) => {
            var _a;
            const key = [parentName, folderName].filter(Boolean).join('/');
            const prev = (_a = p[key]) !== null && _a !== void 0 ? _a : false;
            const foldersExpandedState = {
                ...p,
                [key]: !prev,
            };
            (0, persist_open_folders_1.persistExpandedFolders)('assets', foldersExpandedState);
            return foldersExpandedState;
        });
    }, [setAssetFoldersExpanded]);
    const { isDropDiv, onDragEnter, onDragLeave } = (0, use_asset_drag_events_1.default)({
        name: null,
        parentFolder: null,
        dropLocation,
        setDropLocation,
    });
    const onDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
    }, []);
    const onDrop = (0, react_1.useCallback)(async (e) => {
        try {
            e.preventDefault();
            e.stopPropagation();
            const { files } = e.dataTransfer;
            const assetPath = dropLocation !== null && dropLocation !== void 0 ? dropLocation : null;
            const makePath = (file) => {
                return [assetPath, file.name].filter(Boolean).join('/');
            };
            for (const file of files) {
                const body = await file.arrayBuffer();
                await (0, write_static_file_1.writeStaticFile)({
                    contents: body,
                    filePath: makePath(file),
                });
            }
            if (files.length === 1) {
                (0, NotificationCenter_1.showNotification)(`Created ${makePath(files[0])}`, 3000);
            }
            else {
                (0, NotificationCenter_1.showNotification)(`Added ${files.length} files to ${assetPath}`, 3000);
            }
        }
        catch (error) {
            (0, NotificationCenter_1.showNotification)(`Error during upload: ${error}`, 3000);
        }
        finally {
            setDropLocation(null);
        }
    }, [dropLocation]);
    return (jsx_runtime_1.jsxs("div", { style: container, onDragOver: shouldAllowUpload ? onDragOver : undefined, onDrop: shouldAllowUpload ? onDrop : undefined, children: [showCurrentAsset ? jsx_runtime_1.jsx(CurrentAsset_1.CurrentAsset, {}) : null, staticFiles.length === 0 ? (publicFolderExists ? (jsx_runtime_1.jsx("div", { style: emptyState, children: jsx_runtime_1.jsxs("div", { style: label, children: ["To add assets, place a file in the", ' ', jsx_runtime_1.jsx("code", { style: styles_1.inlineCodeSnippet, children: "public" }),
                        " folder of your project or drag and drop a file here."] }) })) : (jsx_runtime_1.jsx("div", { style: emptyState, children: jsx_runtime_1.jsxs("div", { style: label, children: ["To add assets, create a folder called", ' ', jsx_runtime_1.jsx("code", { style: styles_1.inlineCodeSnippet, children: "public" }),
                        " in the root of your project and place a file in it."] }) }))) : (jsx_runtime_1.jsx("div", { className: "__remotion-vertical-scrollbar", style: {
                    ...list,
                    backgroundColor: isDropDiv ? colors_1.CLEAR_HOVER : colors_1.BACKGROUND,
                }, onDragEnter: onDragEnter, onDragLeave: onDragLeave, children: jsx_runtime_1.jsx(AssetSelectorItem_1.AssetFolderTree, { item: assetTree, level: 0, parentFolder: null, name: null, tabIndex: tabIndex, toggleFolder: toggleFolder, dropLocation: dropLocation, setDropLocation: setDropLocation, readOnlyStudio: readOnlyStudio }) }))] }));
};
exports.AssetSelector = AssetSelector;
