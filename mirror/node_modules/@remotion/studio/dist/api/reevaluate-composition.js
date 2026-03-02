"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reevaluateComposition = void 0;
const remotion_1 = require("remotion");
const reevaluateComposition = () => {
    var _a;
    (_a = remotion_1.Internals.resolveCompositionsRef.current) === null || _a === void 0 ? void 0 : _a.reloadCurrentlySelectedComposition();
};
exports.reevaluateComposition = reevaluateComposition;
