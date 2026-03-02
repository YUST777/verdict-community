"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompSelectorRef = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const persist_open_folders_1 = require("../helpers/persist-open-folders");
const InitialCompositionLoader_1 = require("./InitialCompositionLoader");
const CompSelectorRef = ({ children }) => {
    const { compositions } = (0, react_1.useContext)(remotion_1.Internals.CompositionManager);
    const [foldersExpanded, setFoldersExpanded] = (0, react_1.useState)((0, persist_open_folders_1.loadExpandedFolders)('compositions'));
    const selectComposition = (0, InitialCompositionLoader_1.useSelectComposition)();
    const toggleFolder = (0, react_1.useCallback)((folderName, parentName) => {
        setFoldersExpanded((p) => {
            var _a;
            const key = (0, persist_open_folders_1.openFolderKey)({ folderName, parentName });
            const prev = (_a = p[key]) !== null && _a !== void 0 ? _a : false;
            const foldersExpandedState = {
                ...p,
                [key]: !prev,
            };
            (0, persist_open_folders_1.persistExpandedFolders)('compositions', foldersExpandedState);
            return foldersExpandedState;
        });
    }, []);
    (0, react_1.useImperativeHandle)(remotion_1.Internals.compositionSelectorRef, () => {
        return {
            expandComposition: (compName) => {
                const compositionToExpand = compositions.find((c) => c.id === compName);
                if (!compositionToExpand) {
                    return;
                }
                const { folderName, parentFolderName } = compositionToExpand;
                if (folderName === null) {
                    return;
                }
                setFoldersExpanded((previousState) => {
                    const foldersExpandedState = {
                        ...previousState,
                    };
                    const currentFolder = folderName;
                    const currentParentName = parentFolderName;
                    const key = (0, persist_open_folders_1.openFolderKey)({
                        folderName: currentFolder,
                        parentName: currentParentName,
                    });
                    const splitted = key.split('/');
                    for (let i = 0; i < splitted.length - 1; i++) {
                        const allExceptLast = i === 0
                            ? (0, persist_open_folders_1.openFolderKey)({
                                folderName: splitted.filter((s) => s !== 'no-parent')[0],
                                parentName: null,
                            })
                            : splitted.slice(0, i + 1).join('/');
                        foldersExpandedState[allExceptLast] = true;
                    }
                    (0, persist_open_folders_1.persistExpandedFolders)('compositions', foldersExpandedState);
                    return foldersExpandedState;
                });
            },
            selectComposition: (compName) => {
                const comp = compositions.find((c) => c.id === compName);
                if (!comp) {
                    throw new Error(`Composition ${compName} not found`);
                }
                selectComposition(comp, true);
            },
            toggleFolder: (folderName, parentName) => {
                toggleFolder(folderName, parentName);
            },
        };
    }, [compositions, selectComposition, toggleFolder]);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            foldersExpanded,
            setFoldersExpanded,
            toggleFolder,
        };
    }, [foldersExpanded, setFoldersExpanded, toggleFolder]);
    return (jsx_runtime_1.jsx(persist_open_folders_1.ExpandedFoldersContext.Provider, { value: contextValue, children: children }));
};
exports.CompSelectorRef = CompSelectorRef;
