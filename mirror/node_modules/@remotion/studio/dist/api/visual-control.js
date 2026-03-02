"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualControl = void 0;
const remotion_1 = require("remotion");
const VisualControls_1 = require("../visual-controls/VisualControls");
const visualControl = (key, value, schema) => {
    if ((0, remotion_1.getRemotionEnvironment)().isRendering) {
        return value;
    }
    if (!VisualControls_1.visualControlRef.current) {
        return value;
    }
    return VisualControls_1.visualControlRef.current.globalVisualControl(key, value, schema);
};
exports.visualControl = visualControl;
