"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositionContextButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_id_1 = require("../helpers/client-id");
const ellipsis_1 = require("../icons/ellipsis");
const InlineDropdown_1 = require("./InlineDropdown");
const CompositionContextButton = ({ visible, values }) => {
    const iconStyle = (0, react_1.useMemo)(() => {
        return {
            style: {
                height: 12,
            },
        };
    }, []);
    const connectionStatus = (0, react_1.useContext)(client_id_1.StudioServerConnectionCtx)
        .previewServerState.type;
    const renderAction = (0, react_1.useCallback)((color) => {
        return jsx_runtime_1.jsx(ellipsis_1.EllipsisIcon, { fill: color, svgProps: iconStyle });
    }, [iconStyle]);
    if (!visible || connectionStatus !== 'connected') {
        return null;
    }
    return jsx_runtime_1.jsx(InlineDropdown_1.InlineDropdown, { renderAction: renderAction, values: values });
};
exports.CompositionContextButton = CompositionContextButton;
