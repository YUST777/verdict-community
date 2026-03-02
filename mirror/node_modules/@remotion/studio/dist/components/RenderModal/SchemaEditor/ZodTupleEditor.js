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
exports.ZodTupleEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const get_zod_if_possible_1 = require("../../get-zod-if-possible");
const create_zod_values_1 = require("./create-zod-values");
const deep_equal_1 = require("./deep-equal");
const Fieldset_1 = require("./Fieldset");
const local_state_1 = require("./local-state");
const SchemaLabel_1 = require("./SchemaLabel");
const SchemaSeparationLine_1 = require("./SchemaSeparationLine");
const SchemaVerticalGuide_1 = require("./SchemaVerticalGuide");
const zod_schema_type_1 = require("./zod-schema-type");
const ZodFieldValidation_1 = require("./ZodFieldValidation");
const ZodTupleItemEditor_1 = require("./ZodTupleItemEditor");
const ZodTupleEditor = ({ schema, jsonPath, setValue, defaultValue, value, onSave, showSaveButton, onRemove, saving, saveDisabledByParent, mayPad, }) => {
    const { localValue, onChange, RevisionContextProvider, reset } = (0, local_state_1.useLocalState)({
        unsavedValue: value,
        schema,
        setValue,
        savedValue: defaultValue,
    });
    const [expanded, setExpanded] = (0, react_1.useState)(true);
    const tupleItems = (0, zod_schema_type_1.getTupleItems)(schema);
    const suffix = (0, react_1.useMemo)(() => {
        return expanded ? ' [' : ' [...] ';
    }, [expanded]);
    const z = (0, get_zod_if_possible_1.useZodIfPossible)();
    if (!z) {
        throw new Error('expected zod');
    }
    const zodTypes = (0, get_zod_if_possible_1.useZodTypesIfPossible)();
    const isDefaultValue = (0, react_1.useMemo)(() => {
        return (0, deep_equal_1.deepEqual)(localValue.value, defaultValue);
    }, [defaultValue, localValue]);
    return (jsx_runtime_1.jsxs(Fieldset_1.Fieldset, { shouldPad: mayPad, success: localValue.zodValidation.success, children: [
            jsx_runtime_1.jsx("div", { style: {
                    display: 'flex',
                    flexDirection: 'row',
                }, children: jsx_runtime_1.jsx(SchemaLabel_1.SchemaLabel, { onReset: reset, isDefaultValue: isDefaultValue, jsonPath: jsonPath, onRemove: onRemove, suffix: suffix, onSave: () => {
                        onSave(() => localValue.value, false, false);
                    }, saveDisabledByParent: saveDisabledByParent, saving: saving, showSaveButton: showSaveButton, valid: localValue.zodValidation.success, handleClick: () => setExpanded(!expanded) }) }), expanded ? (jsx_runtime_1.jsx(RevisionContextProvider, { children: jsx_runtime_1.jsxs(SchemaVerticalGuide_1.SchemaVerticalGuide, { isRoot: false, children: [localValue.value.map((child, i) => {
                            var _a;
                            return (
                            // eslint-disable-next-line react/no-array-index-key
                            jsx_runtime_1.jsxs(react_1.default.Fragment, { children: [
                                    jsx_runtime_1.jsx(ZodTupleItemEditor_1.ZodTupleItemEditor, { onChange: onChange, value: child, tupleItems: tupleItems, index: i, jsonPath: jsonPath, defaultValue: (_a = defaultValue === null || defaultValue === void 0 ? void 0 : defaultValue[i]) !== null && _a !== void 0 ? _a : (0, create_zod_values_1.createZodValues)(tupleItems[i], z, zodTypes), onSave: onSave, showSaveButton: showSaveButton, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }), jsx_runtime_1.jsx(SchemaSeparationLine_1.SchemaArrayItemSeparationLine, { schema: schema, index: i, onChange: onChange, isLast: i === localValue.value.length - 1, showAddButton: false })
                                ] }, `${i}${localValue.keyStabilityRevision}`));
                        }), value.length === 0 ? (jsx_runtime_1.jsx(SchemaSeparationLine_1.SchemaArrayItemSeparationLine, { schema: schema, index: 0, onChange: onChange, isLast: true, showAddButton: false })) : null] }) })) : null, jsx_runtime_1.jsx(ZodFieldValidation_1.ZodFieldValidation, { path: jsonPath, localValue: localValue })
        ] }));
};
exports.ZodTupleEditor = ZodTupleEditor;
