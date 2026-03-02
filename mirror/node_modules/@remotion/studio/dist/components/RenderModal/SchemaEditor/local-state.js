"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLocalState = exports.RevisionContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const deep_equal_1 = require("./deep-equal");
const zod_schema_type_1 = require("./zod-schema-type");
exports.RevisionContext = (0, react_1.createContext)({
    childResetRevision: 0,
});
const useLocalState = ({ unsavedValue, schema, setValue, savedValue, }) => {
    const parentRevision = (0, react_1.useContext)(exports.RevisionContext).childResetRevision;
    const [resetRevision, setResetRevision] = (0, react_1.useState)(0);
    const [localValueOrNull, setLocalValue] = (0, react_1.useState)(() => {
        return {
            [parentRevision]: {
                value: unsavedValue,
                keyStabilityRevision: 0,
                zodValidation: (0, zod_schema_type_1.zodSafeParse)(schema, unsavedValue),
            },
        };
    });
    const localUnsavedValue = (0, react_1.useMemo)(() => {
        var _a;
        if (((_a = localValueOrNull[parentRevision]) !== null && _a !== void 0 ? _a : null) === null) {
            return {
                value: unsavedValue,
                keyStabilityRevision: 0,
                zodValidation: (0, zod_schema_type_1.zodSafeParse)(schema, unsavedValue),
            };
        }
        return localValueOrNull[parentRevision];
    }, [localValueOrNull, parentRevision, schema, unsavedValue]);
    (0, react_1.useEffect)(() => {
        const checkFile = () => {
            setResetRevision((old) => old + 1);
            setLocalValue({});
        };
        window.addEventListener(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, checkFile);
        return () => {
            window.removeEventListener(remotion_1.Internals.PROPS_UPDATED_EXTERNALLY, checkFile);
        };
    }, []);
    const currentLocalValue = (0, react_1.useMemo)(() => {
        return (localUnsavedValue !== null && localUnsavedValue !== void 0 ? localUnsavedValue : {
            value: savedValue,
            keyStabilityRevision: 0,
            zodValidation: (0, zod_schema_type_1.zodSafeParse)(schema, savedValue),
        });
    }, [localUnsavedValue, savedValue, schema]);
    const stateRef = (0, react_1.useRef)(currentLocalValue);
    stateRef.current = currentLocalValue;
    const onChange = (0, react_1.useCallback)(
    // Increment is to regenerate `key` attributes in array items,
    // so should increment when changing array items
    (updater, forceApply, increment) => {
        const newValue = updater(stateRef.current.value);
        const isSame = (0, deep_equal_1.deepEqual)(newValue, stateRef.current.value);
        if (isSame) {
            return;
        }
        const safeParse = (0, zod_schema_type_1.zodSafeParse)(schema, newValue);
        if (safeParse.success || forceApply) {
            setValue(updater, forceApply, increment);
        }
        setLocalValue(() => {
            const newState = {
                keyStabilityRevision: currentLocalValue.keyStabilityRevision + (increment ? 1 : 0),
                value: newValue,
                zodValidation: safeParse,
            };
            stateRef.current = newState;
            return {
                ...localUnsavedValue,
                [parentRevision]: newState,
            };
        });
    }, [
        currentLocalValue.keyStabilityRevision,
        localUnsavedValue,
        parentRevision,
        schema,
        setValue,
    ]);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            childResetRevision: resetRevision,
        };
    }, [resetRevision]);
    const reset = (0, react_1.useCallback)(() => {
        // Only need to do key stability for arrays, but
        // since user is not editing right now, should be fine
        onChange(() => savedValue, true, true);
        setResetRevision((old) => old + 1);
    }, [savedValue, onChange]);
    const RevisionContextProvider = (0, react_1.useCallback)(({ children }) => {
        return (jsx_runtime_1.jsx(exports.RevisionContext.Provider, { value: contextValue, children: children }));
    }, [contextValue]);
    return (0, react_1.useMemo)(() => ({
        localValue: currentLocalValue,
        onChange,
        reset,
        RevisionContextProvider,
    }), [RevisionContextProvider, currentLocalValue, onChange, reset]);
};
exports.useLocalState = useLocalState;
