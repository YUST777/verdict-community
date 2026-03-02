"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremountContext = void 0;
const react_1 = require("react");
/**
 * @internal
 * Provides premounting state to internal components.
 * - premountFramesRemaining: accumulated frames remaining until premounting ends (0 if not premounting).
 * - playing: whether the player is currently playing. Sticky true: if any parent is playing, this is true.
 */
exports.PremountContext = (0, react_1.createContext)({
    premountFramesRemaining: 0,
    playing: false,
});
