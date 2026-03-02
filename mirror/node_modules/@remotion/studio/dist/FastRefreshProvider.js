"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastRefreshProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const fast_refresh_context_1 = require("./fast-refresh-context");
const FastRefreshProvider = ({ children }) => {
    const [fastRefreshes, setFastRefreshes] = (0, react_1.useState)(0);
    const [manualRefreshes, setManualRefreshes] = (0, react_1.useState)(0);
    const increaseManualRefreshes = (0, react_1.useCallback)(() => {
        setManualRefreshes((i) => i + 1);
    }, []);
    (0, react_1.useEffect)(() => {
        if (typeof __webpack_module__ !== 'undefined') {
            if (__webpack_module__.hot) {
                __webpack_module__.hot.addStatusHandler((status) => {
                    if (status === 'idle') {
                        setFastRefreshes((i) => i + 1);
                    }
                });
            }
        }
    }, []);
    const value = (0, react_1.useMemo)(() => ({ fastRefreshes, manualRefreshes, increaseManualRefreshes }), [fastRefreshes, manualRefreshes, increaseManualRefreshes]);
    return (jsx_runtime_1.jsx(fast_refresh_context_1.FastRefreshContext.Provider, { value: value, children: children }));
};
exports.FastRefreshProvider = FastRefreshProvider;
