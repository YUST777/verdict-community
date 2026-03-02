"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableFileName = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const colors_1 = require("../../helpers/colors");
const open_in_editor_1 = require("../../helpers/open-in-editor");
const Fieldset_1 = require("../RenderModal/SchemaEditor/Fieldset");
const source_attribution_1 = require("../Timeline/TimelineStack/source-attribution");
const container = {
    paddingLeft: Fieldset_1.SCHEMA_EDITOR_FIELDSET_PADDING,
    paddingTop: Fieldset_1.SCHEMA_EDITOR_FIELDSET_PADDING / 2,
};
const ClickableFileName = ({ originalFileName, }) => {
    const [titleHovered, setTitleHovered] = (0, react_1.useState)(false);
    const hoverEffect = titleHovered && originalFileName.type === 'loaded';
    const onTitlePointerEnter = (0, react_1.useCallback)(() => {
        setTitleHovered(true);
    }, []);
    const onTitlePointerLeave = (0, react_1.useCallback)(() => {
        setTitleHovered(false);
    }, []);
    const style = (0, react_1.useMemo)(() => {
        return {
            fontSize: 12,
            cursor: originalFileName.type === 'loaded' ? 'pointer' : undefined,
            borderBottom: hoverEffect ? '1px solid #fff' : 'none',
            color: hoverEffect ? '#fff' : colors_1.LIGHT_COLOR,
        };
    }, [originalFileName, hoverEffect]);
    const onClick = (0, react_1.useCallback)(async () => {
        if (originalFileName.type !== 'loaded') {
            return;
        }
        await (0, open_in_editor_1.openOriginalPositionInEditor)(originalFileName.originalFileName);
    }, [originalFileName]);
    return (jsx_runtime_1.jsx("div", { style: container, children: jsx_runtime_1.jsx("span", { style: style, onClick: onClick, onPointerEnter: onTitlePointerEnter, onPointerLeave: onTitlePointerLeave, children: originalFileName.type === 'loaded'
                ? (0, source_attribution_1.getOriginalSourceAttribution)(originalFileName.originalFileName)
                : originalFileName.type === 'loading'
                    ? 'Loading...'
                    : 'Error loading' }) }));
};
exports.ClickableFileName = ClickableFileName;
