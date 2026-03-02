"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle = void 0;
const remotion_1 = require("remotion");
/*
 * @description Toggle playback of the current composition.
 * @see [Documentation](https://www.remotion.dev/docs/studio/toggle)
 */
const toggle = (e) => {
    var _a;
    (_a = remotion_1.Internals.timeValueRef.current) === null || _a === void 0 ? void 0 : _a.toggle(e);
};
exports.toggle = toggle;
