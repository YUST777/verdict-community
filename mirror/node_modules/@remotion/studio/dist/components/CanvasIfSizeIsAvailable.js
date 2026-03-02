"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasIfSizeIsAvailable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const editor_rulers_1 = require("../state/editor-rulers");
const CanvasOrLoading_1 = require("./CanvasOrLoading");
const use_is_ruler_visible_1 = require("./EditorRuler/use-is-ruler-visible");
const CanvasIfSizeIsAvailable = () => {
    const rulersAreVisible = (0, use_is_ruler_visible_1.useIsRulerVisible)();
    const context = (0, react_1.useContext)(remotion_1.Internals.CurrentScaleContext);
    const sizeWithRulersApplied = (0, react_1.useMemo)(() => {
        const size = context && context.type === 'canvas-size' ? context.canvasSize : null;
        if (!rulersAreVisible) {
            return size;
        }
        if (!size) {
            return null;
        }
        return {
            ...size,
            width: size.width - editor_rulers_1.RULER_WIDTH,
            height: size.height - editor_rulers_1.RULER_WIDTH,
        };
    }, [context, rulersAreVisible]);
    if (!sizeWithRulersApplied) {
        return null;
    }
    return jsx_runtime_1.jsx(CanvasOrLoading_1.CanvasOrLoading, { size: sizeWithRulersApplied });
};
exports.CanvasIfSizeIsAvailable = CanvasIfSizeIsAvailable;
