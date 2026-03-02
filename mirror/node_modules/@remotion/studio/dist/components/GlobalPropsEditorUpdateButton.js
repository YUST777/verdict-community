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
exports.GlobalPropsEditorUpdateButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const remotion_1 = require("remotion");
const save_default_props_1 = require("../api/save-default-props");
const fast_refresh_context_1 = require("../fast-refresh-context");
const NotificationCenter_1 = require("./Notifications/NotificationCenter");
const SchemaResetButton_1 = require("./RenderModal/SchemaEditor/SchemaResetButton");
const SchemaSaveButton_1 = require("./RenderModal/SchemaEditor/SchemaSaveButton");
const container = {
    display: 'inline-block',
    flexDirection: 'row',
};
const GlobalPropsEditorUpdateButton = ({ compositionId, currentDefaultProps }) => {
    const { fastRefreshes } = (0, react_1.useContext)(fast_refresh_context_1.FastRefreshContext);
    const [disabled, setDisabled] = react_1.default.useState(false);
    const onClicked = (0, react_1.useCallback)(() => {
        setDisabled(true);
        window.remotion_ignoreFastRefreshUpdate = fastRefreshes + 1;
        (0, save_default_props_1.saveDefaultProps)({
            compositionId,
            defaultProps: () => currentDefaultProps,
        })
            .catch((err) => {
            (0, NotificationCenter_1.showNotification)(`Cannot update default props: ${err.stack}`, 2000);
        })
            .finally(() => {
            setDisabled(true);
        });
    }, [compositionId, currentDefaultProps, fastRefreshes]);
    const onReset = (0, react_1.useCallback)(() => {
        window.remotion_ignoreFastRefreshUpdate = null;
        window.dispatchEvent(new CustomEvent(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, {
            detail: {
                resetUnsaved: compositionId,
            },
        }));
    }, [compositionId]);
    return (jsx_runtime_1.jsxs("div", { style: container, children: [
            jsx_runtime_1.jsx(SchemaResetButton_1.SchemaResetButton, { onClick: onReset }), jsx_runtime_1.jsx(SchemaSaveButton_1.SchemaSaveButton, { disabled: disabled, onClick: onClicked })
        ] }));
};
exports.GlobalPropsEditorUpdateButton = GlobalPropsEditorUpdateButton;
