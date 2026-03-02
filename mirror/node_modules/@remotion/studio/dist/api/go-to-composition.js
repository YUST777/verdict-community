"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goToComposition = void 0;
const remotion_1 = require("remotion");
/**
 * Selects a composition in the Remotion Studio.
 * @param compositionId - The ID of the composition to select.
 * @see [Documentation](/docs/studio/go-to-composition)
 */
const goToComposition = (compositionId) => {
    var _a;
    (_a = remotion_1.Internals.compositionSelectorRef.current) === null || _a === void 0 ? void 0 : _a.selectComposition(compositionId);
};
exports.goToComposition = goToComposition;
