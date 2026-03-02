"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pause = void 0;
const remotion_1 = require("remotion");
/*
 * @description Pause the current composition.
 * @see [Documentation](https://www.remotion.dev/docs/studio/pause)
 */
const pause = () => {
    var _a;
    (_a = remotion_1.Internals.timeValueRef.current) === null || _a === void 0 ? void 0 : _a.pause();
};
exports.pause = pause;
