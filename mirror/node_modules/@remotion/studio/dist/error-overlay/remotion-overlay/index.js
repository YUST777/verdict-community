"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountRemotionOverlay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".
// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here
const client_1 = __importDefault(require("react-dom/client"));
const Overlay_1 = require("./Overlay");
const mountRemotionOverlay = () => {
    if (client_1.default.createRoot) {
        client_1.default.createRoot(document.getElementById('remotion-error-overlay')).render(jsx_runtime_1.jsx(Overlay_1.Overlay, {}));
    }
    else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client_1.default.render(jsx_runtime_1.jsx(Overlay_1.Overlay, {}), document.getElementById('remotion-error-overlay'));
    }
};
exports.mountRemotionOverlay = mountRemotionOverlay;
