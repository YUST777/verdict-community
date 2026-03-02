"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seek = void 0;
const remotion_1 = require("remotion");
/*
 * @description Jump to a different time in the timeline.
 * @see [Documentation](https://www.remotion.dev/docs/studio/seek)
 */
const seek = (frame) => {
    var _a;
    (_a = remotion_1.Internals.timeValueRef.current) === null || _a === void 0 ? void 0 : _a.seek(Math.max(0, frame));
};
exports.seek = seek;
