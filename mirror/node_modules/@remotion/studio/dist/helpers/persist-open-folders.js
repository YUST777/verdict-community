"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandedFoldersContext = exports.loadExpandedFolders = exports.persistExpandedFolders = exports.openFolderKey = void 0;
const react_1 = require("react");
const openFolderKey = ({ folderName, parentName, }) => {
    return [parentName !== null && parentName !== void 0 ? parentName : 'no-parent', folderName].join('/');
};
exports.openFolderKey = openFolderKey;
const localStorageKey = (type) => type === 'compositions'
    ? 'remotion.expandedFolders'
    : 'remotion.expandedAssetFolders';
const persistExpandedFolders = (type, state) => {
    window.localStorage.setItem(localStorageKey(type), JSON.stringify(state));
};
exports.persistExpandedFolders = persistExpandedFolders;
const loadExpandedFolders = (type) => {
    const item = window.localStorage.getItem(localStorageKey(type));
    if (item === null) {
        return {};
    }
    return JSON.parse(item);
};
exports.loadExpandedFolders = loadExpandedFolders;
exports.ExpandedFoldersContext = (0, react_1.createContext)({
    toggleFolder: () => { },
    foldersExpanded: {},
    setFoldersExpanded: () => { },
});
