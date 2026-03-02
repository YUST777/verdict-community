"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.play = void 0;
const remotion_1 = require("remotion");
/*
 * @description Play the current composition.
 * @see [Documentation](https://www.remotion.dev/docs/studio/play)
 */
const play = (e) => {
    var _a;
    (_a = remotion_1.Internals.timeValueRef.current) === null || _a === void 0 ? void 0 : _a.play(e);
};
exports.play = play;
