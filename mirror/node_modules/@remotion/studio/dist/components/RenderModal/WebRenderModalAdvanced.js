"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRenderModalAdvanced = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Checkmark_1 = require("../../icons/Checkmark");
const Checkbox_1 = require("../Checkbox");
const layout_1 = require("../layout");
const ComboBox_1 = require("../NewComposition/ComboBox");
const layout_2 = require("./layout");
const NumberSetting_1 = require("./NumberSetting");
const OptionExplainerBubble_1 = require("./OptionExplainerBubble");
const tabContainer = {
    flex: 1,
};
const WebRenderModalAdvanced = ({ renderMode, delayRenderTimeout, setDelayRenderTimeout, mediaCacheSizeInBytes, setMediaCacheSizeInBytes, hardwareAcceleration, setHardwareAcceleration, }) => {
    const toggleCustomMediaCacheSizeInBytes = (0, react_1.useCallback)(() => {
        setMediaCacheSizeInBytes((previous) => {
            if (previous === null) {
                return 1000 * 1000 * 1000;
            }
            return null;
        });
    }, [setMediaCacheSizeInBytes]);
    const changeMediaCacheSizeInBytes = (0, react_1.useCallback)((cb) => {
        setMediaCacheSizeInBytes((prev) => {
            if (prev === null) {
                throw new TypeError('Expected previous value');
            }
            if (typeof cb === 'function') {
                return cb(prev);
            }
            return cb;
        });
    }, [setMediaCacheSizeInBytes]);
    const hardwareAccelerationOptions = (0, react_1.useMemo)(() => {
        return [
            {
                label: 'No Preference',
                onClick: () => setHardwareAcceleration('no-preference'),
                leftItem: hardwareAcceleration === 'no-preference' ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: 'no-preference',
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: 'no-preference',
            },
            {
                label: 'Prefer Hardware',
                onClick: () => setHardwareAcceleration('prefer-hardware'),
                leftItem: hardwareAcceleration === 'prefer-hardware' ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: 'prefer-hardware',
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: 'prefer-hardware',
            },
            {
                label: 'Prefer Software',
                onClick: () => setHardwareAcceleration('prefer-software'),
                leftItem: hardwareAcceleration === 'prefer-software' ? jsx_runtime_1.jsx(Checkmark_1.Checkmark, {}) : null,
                id: 'prefer-software',
                keyHint: null,
                quickSwitcherLabel: null,
                subMenu: null,
                type: 'item',
                value: 'prefer-software',
            },
        ];
    }, [hardwareAcceleration, setHardwareAcceleration]);
    return (jsx_runtime_1.jsxs("div", { style: tabContainer, children: [
            jsx_runtime_1.jsx(NumberSetting_1.NumberSetting, { name: "Delay Render Timeout", formatter: (v) => `${v}ms`, min: 0, max: 1000000000, step: 1000, value: delayRenderTimeout, onValueChanged: setDelayRenderTimeout, hint: "delayRenderTimeoutInMillisecondsOption" }), jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                    jsx_runtime_1.jsxs("div", { style: layout_2.label, children: ["Custom @remotion/media cache size ",
                            jsx_runtime_1.jsx(layout_1.Spacing, { x: 0.5 }), jsx_runtime_1.jsx(OptionExplainerBubble_1.OptionExplainerBubble, { id: "mediaCacheSizeInBytesOption" })
                        ] }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(Checkbox_1.Checkbox, { checked: mediaCacheSizeInBytes !== null, onChange: toggleCustomMediaCacheSizeInBytes, name: "media-cache-size" }) })
                ] }), mediaCacheSizeInBytes === null ? null : (jsx_runtime_1.jsx(NumberSetting_1.NumberSetting, { name: "@remotion/media cache size", formatter: (w) => `${w} bytes`, min: 0, max: 10000000000, step: 10 * 1024 * 1024, value: mediaCacheSizeInBytes, onValueChanged: changeMediaCacheSizeInBytes })), renderMode === 'video' ? (jsx_runtime_1.jsxs("div", { style: layout_2.optionRow, children: [
                    jsx_runtime_1.jsx("div", { style: layout_2.label, children: "Hardware Acceleration" }), jsx_runtime_1.jsx("div", { style: layout_2.rightRow, children: jsx_runtime_1.jsx(ComboBox_1.Combobox, { values: hardwareAccelerationOptions, selectedId: hardwareAcceleration, title: "Hardware Acceleration" }) })
                ] })) : null] }));
};
exports.WebRenderModalAdvanced = WebRenderModalAdvanced;
