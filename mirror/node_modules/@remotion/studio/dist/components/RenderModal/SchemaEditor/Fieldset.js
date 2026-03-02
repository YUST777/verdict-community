"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fieldset = exports.SCHEMA_EDITOR_FIELDSET_PADDING = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.SCHEMA_EDITOR_FIELDSET_PADDING = 10;
const AlreadyPaddedRightContext = (0, react_1.createContext)(false);
const Fieldset = ({ children, shouldPad }) => {
    const alreadyPadded = (0, react_1.useContext)(AlreadyPaddedRightContext);
    const style = (0, react_1.useMemo)(() => {
        if (shouldPad) {
            return {
                padding: exports.SCHEMA_EDITOR_FIELDSET_PADDING,
                paddingTop: exports.SCHEMA_EDITOR_FIELDSET_PADDING / 2,
                paddingRight: alreadyPadded ? 0 : exports.SCHEMA_EDITOR_FIELDSET_PADDING,
            };
        }
        return {};
    }, [alreadyPadded, shouldPad]);
    const content = jsx_runtime_1.jsx("div", { style: style, children: children });
    if (shouldPad) {
        return (jsx_runtime_1.jsx(AlreadyPaddedRightContext.Provider, { value: true, children: content }));
    }
    return content;
};
exports.Fieldset = Fieldset;
