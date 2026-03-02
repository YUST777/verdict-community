"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../helpers/colors");
const Checkmark_1 = require("../icons/Checkmark");
const size = 20;
const background = {
    height: size,
    width: size,
    position: 'relative',
};
const bullet = {
    width: 10,
    height: 10,
    backgroundColor: colors_1.LIGHT_TEXT,
    borderRadius: '50%',
};
const box = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: size,
    width: size,
    top: 0,
    left: 0,
    pointerEvents: 'none',
    color: 'white',
};
const Checkbox = ({ checked, onChange, disabled, name, rounded }) => {
    const ref = (0, react_1.useRef)(null);
    const input = (0, react_1.useMemo)(() => {
        return {
            appearance: 'none',
            background: disabled ? 'transparent' : colors_1.INPUT_BACKGROUND,
            border: '1px solid ' + colors_1.INPUT_BORDER_COLOR_UNHOVERED,
            height: size,
            width: size,
            top: 0,
            left: 0,
            position: 'absolute',
            margin: 0,
        };
    }, [disabled]);
    (0, react_1.useEffect)(() => {
        if (ref.current) {
            ref.current.style.setProperty('border-radius', rounded ? '50%' : '0%', 'important');
        }
    }, [rounded]);
    return (jsx_runtime_1.jsxs("div", { style: background, children: [
            jsx_runtime_1.jsx("input", { ref: ref, style: input, type: 'checkbox', checked: checked, onChange: onChange, disabled: disabled, name: name }), jsx_runtime_1.jsx("div", { style: box, children: checked ? rounded ? jsx_runtime_1.jsx("div", { style: bullet }) : jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null })
        ] }));
};
exports.Checkbox = Checkbox;
