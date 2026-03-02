"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodSwitch = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const get_zod_if_possible_1 = require("../../get-zod-if-possible");
const zod_schema_type_1 = require("./zod-schema-type");
const ZodArrayEditor_1 = require("./ZodArrayEditor");
const ZodBooleanEditor_1 = require("./ZodBooleanEditor");
const ZodColorEditor_1 = require("./ZodColorEditor");
const ZodDateEditor_1 = require("./ZodDateEditor");
const ZodDefaultEditor_1 = require("./ZodDefaultEditor");
const ZodDiscriminatedUnionEditor_1 = require("./ZodDiscriminatedUnionEditor");
const ZodEffectEditor_1 = require("./ZodEffectEditor");
const ZodEnumEditor_1 = require("./ZodEnumEditor");
const ZodMatrixEditor_1 = require("./ZodMatrixEditor");
const ZodNonEditableValue_1 = require("./ZodNonEditableValue");
const ZodNullableEditor_1 = require("./ZodNullableEditor");
const ZodNumberEditor_1 = require("./ZodNumberEditor");
const ZodObjectEditor_1 = require("./ZodObjectEditor");
const ZodOptionalEditor_1 = require("./ZodOptionalEditor");
const ZodStaticFileEditor_1 = require("./ZodStaticFileEditor");
const ZodStringEditor_1 = require("./ZodStringEditor");
const ZodTextareaEditor_1 = require("./ZodTextareaEditor");
const ZodTupleEditor_1 = require("./ZodTupleEditor");
const ZodUnionEditor_1 = require("./ZodUnionEditor");
const ZodSwitch = ({ schema, jsonPath, value, setValue, defaultValue, onSave, showSaveButton, onRemove, saving, saveDisabledByParent, mayPad, }) => {
    const typeName = (0, zod_schema_type_1.getZodSchemaType)(schema);
    const description = (0, zod_schema_type_1.getZodSchemaDescription)(schema);
    const zodTypes = (0, get_zod_if_possible_1.useZodTypesIfPossible)();
    if (typeName === 'object') {
        return (jsx_runtime_1.jsx(ZodObjectEditor_1.ZodObjectEditor, { setValue: setValue, unsavedValue: value, savedValue: defaultValue, jsonPath: jsonPath, schema: schema, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad, discriminatedUnionReplacement: null }));
    }
    if (typeName === 'string') {
        // In v4, .refine() doesn't wrap in ZodEffects, so check brand here too
        if (zodTypes &&
            description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND) {
            return (jsx_runtime_1.jsx(ZodColorEditor_1.ZodColorEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, onSave: onSave, defaultValue: defaultValue, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        if (value.startsWith(window.remotion_staticBase)) {
            return (jsx_runtime_1.jsx(ZodStaticFileEditor_1.ZodStaticFileEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        if (zodTypes &&
            description === zodTypes.ZodZypesInternals.REMOTION_TEXTAREA_BRAND) {
            return (jsx_runtime_1.jsx(ZodTextareaEditor_1.ZodTextareaEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, onSave: onSave, defaultValue: defaultValue, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        return (jsx_runtime_1.jsx(ZodStringEditor_1.ZodStringEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, onSave: onSave, defaultValue: defaultValue, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'date') {
        return (jsx_runtime_1.jsx(ZodDateEditor_1.ZodDateEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, onSave: onSave, defaultValue: defaultValue, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'number') {
        return (jsx_runtime_1.jsx(ZodNumberEditor_1.ZodNumberEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'boolean') {
        return (jsx_runtime_1.jsx(ZodBooleanEditor_1.ZodBooleanEditor, { value: value, setValue: setValue, jsonPath: jsonPath, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad, schema: schema }));
    }
    if (typeName === 'undefined') {
        return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: 'undefined', saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'null') {
        return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: 'null', saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'any') {
        return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: 'any (not editable)', saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'bigint') {
        return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: 'BigInt (not editable)', saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'unknown') {
        return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: 'unknown (not editable)', saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'array') {
        // In v4, .refine() doesn't wrap in ZodEffects, so check brand here too
        if (zodTypes &&
            description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
            return (jsx_runtime_1.jsx(ZodMatrixEditor_1.ZodMatrixEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        return (jsx_runtime_1.jsx(ZodArrayEditor_1.ZodArrayEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'enum') {
        return (jsx_runtime_1.jsx(ZodEnumEditor_1.ZodEnumEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving }));
    }
    // In v3, effects wrap schemas (e.g. .refine(), .transform()).
    // In v4, refine/transform are embedded as checks, so this only applies to v3.
    if (typeName === 'effects') {
        if (zodTypes &&
            description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND) {
            return (jsx_runtime_1.jsx(ZodColorEditor_1.ZodColorEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, onSave: onSave, defaultValue: defaultValue, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        if (zodTypes &&
            description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND) {
            return (jsx_runtime_1.jsx(ZodMatrixEditor_1.ZodMatrixEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: (0, zod_schema_type_1.getEffectsInner)(schema), defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
        }
        return (jsx_runtime_1.jsx(ZodEffectEditor_1.ZodEffectEditor, { value: value, setValue: setValue, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, mayPad: mayPad }));
    }
    if (typeName === 'union') {
        return (jsx_runtime_1.jsx(ZodUnionEditor_1.ZodUnionEditor, { schema: schema, showSaveButton: showSaveButton, jsonPath: jsonPath, value: value, defaultValue: defaultValue, setValue: setValue, onSave: onSave, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'optional') {
        return (jsx_runtime_1.jsx(ZodOptionalEditor_1.ZodOptionalEditor, { jsonPath: jsonPath, showSaveButton: showSaveButton, defaultValue: defaultValue, value: value, setValue: setValue, onSave: onSave, onRemove: onRemove, schema: schema, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'nullable') {
        return (jsx_runtime_1.jsx(ZodNullableEditor_1.ZodNullableEditor, { jsonPath: jsonPath, showSaveButton: showSaveButton, defaultValue: defaultValue, value: value, setValue: setValue, onSave: onSave, onRemove: onRemove, schema: schema, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'default') {
        return (jsx_runtime_1.jsx(ZodDefaultEditor_1.ZodDefaultEditor, { jsonPath: jsonPath, showSaveButton: showSaveButton, defaultValue: defaultValue, value: value, setValue: setValue, onSave: onSave, onRemove: onRemove, schema: schema, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    if (typeName === 'discriminatedUnion') {
        return (jsx_runtime_1.jsx(ZodDiscriminatedUnionEditor_1.ZodDiscriminatedUnionEditor, { defaultValue: defaultValue, mayPad: mayPad, schema: schema, setValue: setValue, value: value, jsonPath: jsonPath, onRemove: onRemove, onSave: onSave, saving: saving, saveDisabledByParent: saveDisabledByParent, showSaveButton: showSaveButton }));
    }
    if (typeName === 'tuple') {
        return (jsx_runtime_1.jsx(ZodTupleEditor_1.ZodTupleEditor, { setValue: setValue, value: value, jsonPath: jsonPath, schema: schema, defaultValue: defaultValue, onSave: onSave, showSaveButton: showSaveButton, onRemove: onRemove, saving: saving, saveDisabledByParent: saveDisabledByParent, mayPad: mayPad }));
    }
    return (jsx_runtime_1.jsx(ZodNonEditableValue_1.ZonNonEditableValue, { jsonPath: jsonPath, showSaveButton: showSaveButton, label: `${typeName} (not editable)`, saving: saving, mayPad: mayPad }));
};
exports.ZodSwitch = ZodSwitch;
