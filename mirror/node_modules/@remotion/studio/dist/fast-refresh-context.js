"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastRefreshContext = void 0;
const react_1 = require("react");
exports.FastRefreshContext = (0, react_1.createContext)({
    fastRefreshes: 0,
    manualRefreshes: 0,
    increaseManualRefreshes: () => { },
});
