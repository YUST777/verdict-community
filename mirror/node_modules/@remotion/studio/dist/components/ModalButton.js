"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../helpers/colors");
const Button_1 = require("./Button");
const buttonStyle = {
    backgroundColor: colors_1.BLUE,
    color: 'white',
};
const ModalButton = (props) => {
    const style = (0, react_1.useMemo)(() => {
        return {
            ...buttonStyle,
            backgroundColor: props.disabled ? colors_1.BLUE_DISABLED : colors_1.BLUE,
        };
    }, [props.disabled]);
    return jsx_runtime_1.jsx(Button_1.Button, { ...props, style: style });
};
exports.ModalButton = ModalButton;
