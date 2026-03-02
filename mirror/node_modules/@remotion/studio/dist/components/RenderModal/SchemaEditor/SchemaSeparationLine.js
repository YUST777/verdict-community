"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaArrayItemSeparationLine = exports.SchemaSeparationLine = exports.VERTICAL_GUIDE_HEIGHT = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../../../helpers/colors");
const plus_1 = require("../../../icons/plus");
const get_zod_if_possible_1 = require("../../get-zod-if-possible");
const layout_1 = require("../../layout");
const layout_2 = require("../layout");
const create_zod_values_1 = require("./create-zod-values");
const zod_schema_type_1 = require("./zod-schema-type");
exports.VERTICAL_GUIDE_HEIGHT = 24;
const line = {
    borderBottom: '1px solid ' + colors_1.LINE_COLOR,
};
const SchemaSeparationLine = () => {
    return jsx_runtime_1.jsx("div", { style: line });
};
exports.SchemaSeparationLine = SchemaSeparationLine;
const arraySeparationLine = {
    borderBottom: '1px solid ' + colors_1.LINE_COLOR,
    marginTop: -exports.VERTICAL_GUIDE_HEIGHT / 2,
    pointerEvents: 'none',
    width: '100%',
    flexBasis: '100%',
};
const SchemaArrayItemSeparationLine = ({ onChange, index, schema, isLast, showAddButton }) => {
    const [outerHovered, setOuterHovered] = (0, react_1.useState)(false);
    const [innerHovered, setInnerHovered] = (0, react_1.useState)(false);
    const zodTypes = (0, get_zod_if_possible_1.useZodTypesIfPossible)();
    const z = (0, get_zod_if_possible_1.useZodIfPossible)();
    if (!z) {
        throw new Error('expected zod');
    }
    const arrayElement = (0, zod_schema_type_1.getArrayElement)(schema);
    const onAdd = (0, react_1.useCallback)(() => {
        onChange((oldV) => {
            return [
                ...oldV.slice(0, index + 1),
                (0, create_zod_values_1.createZodValues)(arrayElement, z, zodTypes),
                ...oldV.slice(index + 1),
            ];
        }, false, true);
    }, [arrayElement, index, onChange, z, zodTypes]);
    const dynamicAddButtonStyle = (0, react_1.useMemo)(() => {
        return {
            display: 'flex',
            justifyContent: 'center',
            height: exports.VERTICAL_GUIDE_HEIGHT,
            opacity: outerHovered || isLast ? 1 : 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        };
    }, [isLast, outerHovered]);
    const inner = (0, react_1.useMemo)(() => {
        return {
            background: colors_1.BACKGROUND,
            paddingLeft: 10,
            paddingRight: 10,
        };
    }, []);
    const onOuterMouseEnter = (0, react_1.useCallback)(() => {
        setOuterHovered(true);
    }, []);
    const onOuterMouseLeave = (0, react_1.useCallback)(() => {
        setOuterHovered(false);
    }, []);
    const onInnerMouseEnter = (0, react_1.useCallback)(() => {
        setInnerHovered(true);
    }, []);
    const onInnerMouseLeave = (0, react_1.useCallback)(() => {
        setInnerHovered(false);
    }, []);
    return (jsx_runtime_1.jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'row',
            height: exports.VERTICAL_GUIDE_HEIGHT,
        }, children: [
            jsx_runtime_1.jsxs("div", { style: {
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }, children: [showAddButton && (jsx_runtime_1.jsx("div", { style: dynamicAddButtonStyle, onPointerEnter: onOuterMouseEnter, onPointerLeave: onOuterMouseLeave, children: jsx_runtime_1.jsx("div", { onClick: onAdd, style: inner, onPointerEnter: onInnerMouseEnter, onPointerLeave: onInnerMouseLeave, children: jsx_runtime_1.jsx(plus_1.Plus, { color: innerHovered ? 'white' : colors_1.LIGHT_TEXT, style: { height: exports.VERTICAL_GUIDE_HEIGHT / 2 } }) }) })), jsx_runtime_1.jsx("div", { style: arraySeparationLine })
                ] }), isLast ? (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [
                    jsx_runtime_1.jsx(layout_1.Spacing, { x: 1 }), jsx_runtime_1.jsx("div", { style: {
                            ...layout_2.fieldSetText,
                            alignItems: 'center',
                            display: 'flex',
                        }, children: ']' })
                ] })) : null] }));
};
exports.SchemaArrayItemSeparationLine = SchemaArrayItemSeparationLine;
