"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpandedTracksProvider = exports.ExpandedTracksContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.ExpandedTracksContext = (0, react_1.createContext)({
    expandedTracks: {},
    toggleTrack: () => {
        throw new Error('ExpandedTracksContext not initialized');
    },
});
const ExpandedTracksProvider = ({ children }) => {
    const [expandedTracks, setExpandedTracks] = (0, react_1.useState)({});
    const toggleTrack = (0, react_1.useCallback)((id) => {
        setExpandedTracks((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }, []);
    const value = (0, react_1.useMemo)(() => ({
        expandedTracks,
        toggleTrack,
    }), [expandedTracks, toggleTrack]);
    return (jsx_runtime_1.jsx(exports.ExpandedTracksContext.Provider, { value: value, children: children }));
};
exports.ExpandedTracksProvider = ExpandedTracksProvider;
