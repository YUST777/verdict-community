"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualControlsContent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const VisualControls_1 = require("../../visual-controls/VisualControls");
const is_menu_item_1 = require("../Menu/is-menu-item");
const SchemaSeparationLine_1 = require("../RenderModal/SchemaEditor/SchemaSeparationLine");
const VisualControlHandle_1 = require("./VisualControlHandle");
const container = {
    overflowY: 'auto',
};
const VisualControlsContent = () => {
    const { handles } = (0, react_1.useContext)(VisualControls_1.VisualControlsContext);
    const entries = Object.entries(handles);
    return (jsx_runtime_1.jsx("div", { style: container, className: is_menu_item_1.VERTICAL_SCROLLBAR_CLASSNAME, children: entries.map(([key, value], i) => {
            return (jsx_runtime_1.jsxs(react_1.default.Fragment, { children: [
                    jsx_runtime_1.jsx(VisualControlHandle_1.VisualControlHandle, { keyName: key, value: value }), i === entries.length - 1 ? null : jsx_runtime_1.jsx(SchemaSeparationLine_1.SchemaSeparationLine, {})] }, key));
        }) }));
};
exports.VisualControlsContent = VisualControlsContent;
