"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualControlsProvider = exports.SetVisualControlsContext = exports.visualControlRef = exports.VisualControlsContext = exports.VisualControlsTabActivatedContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const get_zod_schema_from_primitive_1 = require("../api/get-zod-schema-from-primitive");
const get_zod_if_possible_1 = require("../components/get-zod-if-possible");
const get_current_edited_value_1 = require("./get-current-edited-value");
exports.VisualControlsTabActivatedContext = (0, react_1.createContext)(false);
exports.VisualControlsContext = (0, react_1.createContext)({
    handles: {},
});
exports.visualControlRef = (0, react_1.createRef)();
exports.SetVisualControlsContext = (0, react_1.createContext)({
    updateHandles: () => {
        throw new Error('updateHandles is not implemented');
    },
    updateValue: () => {
        throw new Error('updateValue is not implemented');
    },
    visualControl: () => {
        throw new Error('visualControl is not implemented');
    },
});
const VisualControlsProvider = ({ children }) => {
    const imperativeHandles = (0, react_1.useRef)({});
    const [handles, setHandles] = (0, react_1.useState)({});
    const state = (0, react_1.useMemo)(() => {
        return {
            handles,
        };
    }, [handles]);
    const setControl = (0, react_1.useCallback)((key, value) => {
        var _a, _b, _c, _d;
        const currentUnsaved = (_b = (_a = imperativeHandles.current) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.unsavedValue;
        const currentSavedState = (_d = (_c = imperativeHandles.current) === null || _c === void 0 ? void 0 : _c[key]) === null || _d === void 0 ? void 0 : _d.valueInCode;
        const changedSavedValue = value.valueInCode !== currentSavedState;
        const changedUnsavedValue = currentUnsaved === undefined && value.valueInCode !== undefined;
        imperativeHandles.current = {
            ...imperativeHandles.current,
            [key]: {
                ...value,
                unsavedValue: currentUnsaved !== null && currentUnsaved !== void 0 ? currentUnsaved : value.valueInCode,
                valueInCode: value.valueInCode,
            },
        };
        return {
            changed: changedSavedValue || changedUnsavedValue,
            currentValue: (0, get_current_edited_value_1.getVisualControlEditedValue)({
                key,
                handles: imperativeHandles.current,
            }),
        };
    }, []);
    const z = (0, get_zod_if_possible_1.useZodIfPossible)();
    const changedRef = (0, react_1.useRef)(false);
    const env = (0, remotion_1.useRemotionEnvironment)();
    const visualControl = (0, react_1.useCallback)(
    // eslint-disable-next-line prefer-arrow-callback
    function (key, value, schema) {
        // eslint-disable-next-line no-constant-condition
        if (handles && false) {
            /** Intentional: State is managed imperatively */
        }
        if (!env.isStudio) {
            return value;
        }
        if (!z) {
            return value;
        }
        const { changed, currentValue } = setControl(key, {
            valueInCode: value,
            schema: (schema !== null && schema !== void 0 ? schema : (0, get_zod_schema_from_primitive_1.getZodSchemaFromPrimitive)(value, z)),
            stack: new Error().stack,
        });
        if (changed) {
            changedRef.current = true;
        }
        return currentValue;
    }, [setControl, handles, z, env.isStudio]);
    const updateHandles = (0, react_1.useCallback)(() => {
        setHandles(() => {
            return imperativeHandles.current;
        });
    }, []);
    const updateValue = (0, react_1.useCallback)((key, value) => {
        imperativeHandles.current = {
            ...imperativeHandles.current,
            [key]: {
                ...imperativeHandles.current[key],
                unsavedValue: value,
            },
        };
        updateHandles();
    }, [updateHandles]);
    (0, react_1.useImperativeHandle)(exports.visualControlRef, () => {
        return {
            globalVisualControl: visualControl,
        };
    }, [visualControl]);
    (0, react_1.useEffect)(() => {
        const callback = () => {
            if (imperativeHandles.current) {
                updateHandles();
                changedRef.current = false;
            }
        };
        const interval = setInterval(callback, 100);
        return () => {
            clearInterval(interval);
        };
    }, [updateHandles]);
    const setState = (0, react_1.useMemo)(() => {
        return {
            setControl,
            updateHandles,
            updateValue,
            visualControl,
        };
    }, [setControl, updateHandles, updateValue, visualControl]);
    return (jsx_runtime_1.jsx(exports.VisualControlsTabActivatedContext.Provider, { value: Object.keys(state.handles).length > 0, children: jsx_runtime_1.jsx(exports.VisualControlsContext.Provider, { value: state, children: jsx_runtime_1.jsx(exports.SetVisualControlsContext.Provider, { value: setState, children: children }) }) }));
};
exports.VisualControlsProvider = VisualControlsProvider;
